<?php
/**
 * NCK WEALTH — YouTube Shorts Feed (API-free)
 *
 * Reads the channel's public Shorts page directly instead of relying on the
 * YouTube Data API. This avoids uploads-playlist propagation delays and means
 * no API key is required for the public feed.
 */

define('NCK_APP', true);
error_reporting(E_ALL);
ini_set('display_errors', '0');
header('Content-Type: application/json; charset=UTF-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

function respond(int $httpStatus, array $payload): void
{
    http_response_code($httpStatus);
    echo json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

$configPath = __DIR__ . '/youtube-config.php';
if (!is_file($configPath)) {
    respond(500, ['success' => false, 'error' => 'not_configured']);
}
$config = require $configPath;
$handle = ltrim(trim((string)($config['channel_handle'] ?? 'NCKWEALTH')), '@');
$maxResults = max(1, min(12, (int)($config['short_results'] ?? 4)));
$cacheTtl = max(60, (int)($config['cache_ttl_seconds'] ?? 300));

$cacheDir = __DIR__ . '/cache';
if (!is_dir($cacheDir)) @mkdir($cacheDir, 0755, true);
$cacheFile = $cacheDir . '/youtube-cache.json';
$lockFile = $cacheDir . '/youtube.lock';

function read_cache(string $file): ?array
{
    if (!is_file($file)) return null;
    $data = json_decode((string)@file_get_contents($file), true);
    return (is_array($data) && ($data['source'] ?? '') === 'youtube-shorts-page' && isset($data['videos']) && is_array($data['videos'])) ? $data : null;
}

function respond_from_cache(array $cached, int $maxResults, bool $stale): void
{
    respond(200, [
        'success' => true,
        'videos' => array_slice($cached['videos'], 0, $maxResults),
        'cached' => true,
        'stale' => $stale,
        'generated_at' => $cached['generated_at'] ?? null,
        'source' => 'youtube-shorts-page',
    ]);
}

$cached = read_cache($cacheFile);
if ($cached && isset($cached['generated_at']) && (time() - (int)$cached['generated_at']) < $cacheTtl) {
    respond_from_cache($cached, $maxResults, false);
}

$lockFh = @fopen($lockFile, 'c');
$gotLock = $lockFh && flock($lockFh, LOCK_EX | LOCK_NB);
if (!$gotLock) {
    if ($lockFh) fclose($lockFh);
    if ($cached) respond_from_cache($cached, $maxResults, true);
    respond(200, ['success' => true, 'videos' => [], 'cached' => false, 'refreshing' => true]);
}

function http_get(string $url): array
{
    $headers = [
        'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language: en-US,en;q=0.9',
    ];
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_MAXREDIRS => 3,
            CURLOPT_TIMEOUT => 12,
            CURLOPT_CONNECTTIMEOUT => 6,
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_USERAGENT => 'Mozilla/5.0 (compatible; ColorMagicLab/1.0; +https://nckwealth.com)',
        ]);
        $body = curl_exec($ch);
        $status = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);
        return [$status, (string)$body, $error];
    }

    $ctx = stream_context_create(['http' => [
        'method' => 'GET',
        'timeout' => 12,
        'header' => implode("\r\n", $headers),
        'user_agent' => 'Mozilla/5.0 (compatible; ColorMagicLab/1.0)',
    ]]);
    $body = @file_get_contents($url, false, $ctx);
    return [$body === false ? 0 : 200, $body === false ? '' : $body, $body === false ? 'http_request_failed' : ''];
}

function first_text($value): string
{
    if (!is_array($value)) return '';
    if (isset($value['simpleText']) && is_string($value['simpleText'])) return $value['simpleText'];
    if (isset($value['content']) && is_string($value['content'])) return $value['content'];
    if (isset($value['runs']) && is_array($value['runs'])) {
        $s = '';
        foreach ($value['runs'] as $run) {
            if (is_array($run) && isset($run['text'])) $s .= (string)$run['text'];
        }
        return $s;
    }
    return '';
}

function normalize_video_id(string $id): string
{
    return preg_match('/^[A-Za-z0-9_-]{11}$/', $id) ? $id : '';
}

/**
 * Walk YouTube's ytInitialData and collect Shorts renderers. YouTube changes
 * renderer names occasionally, so this deliberately supports several known
 * structures rather than depending on one exact DOM shape.
 */
function collect_shorts($node, array &$videos, array &$seen): void
{
    if (!is_array($node)) return;

    $candidateId = '';
    $candidateUrl = '';
    if (isset($node['videoId']) && is_string($node['videoId'])) {
        $candidateId = normalize_video_id($node['videoId']);
    }
    if (isset($node['reelWatchEndpoint']['videoId'])) {
        $candidateId = normalize_video_id((string)$node['reelWatchEndpoint']['videoId']);
    }
    if (isset($node['navigationEndpoint']['reelWatchEndpoint']['videoId'])) {
        $candidateId = normalize_video_id((string)$node['navigationEndpoint']['reelWatchEndpoint']['videoId']);
    }
    if (isset($node['navigationEndpoint']['commandMetadata']['webCommandMetadata']['url'])) {
        $candidateUrl = (string)$node['navigationEndpoint']['commandMetadata']['webCommandMetadata']['url'];
        if (preg_match('~/shorts/([A-Za-z0-9_-]{11})~', $candidateUrl, $m)) $candidateId = $m[1];
    }

    $isShortContext = false;
    $keys = array_keys($node);
    foreach ($keys as $k) {
        if (stripos((string)$k, 'shorts') !== false || stripos((string)$k, 'reel') !== false) {
            $isShortContext = true;
            break;
        }
    }
    if ($candidateUrl && strpos($candidateUrl, '/shorts/') !== false) $isShortContext = true;

    if ($candidateId && ($isShortContext || isset($node['reelWatchEndpoint']) || isset($node['shortsLockupViewModel']))) {
        if (!isset($seen[$candidateId])) {
            $title = first_text($node['title'] ?? null);
            if ($title === '') $title = first_text($node['headline'] ?? null);
            if ($title === '') $title = first_text($node['overlayMetadata']['primaryText'] ?? null);
            if ($title === '') $title = first_text($node['accessibility']['accessibilityData'] ?? null);

            $thumb = '';
            $thumbs = $node['thumbnail']['thumbnails'] ?? ($node['thumbnailOverlays'][0]['thumbnail']['thumbnails'] ?? []);
            if (is_array($thumbs) && $thumbs) {
                $last = end($thumbs);
                if (is_array($last) && isset($last['url'])) $thumb = (string)$last['url'];
            }
            if ($thumb === '') $thumb = 'https://i.ytimg.com/vi/' . $candidateId . '/hqdefault.jpg';

            $published = '';
            foreach (['publishedAt','publishedTimeText'] as $pk) {
                if (isset($node[$pk])) {
                    $published = first_text($node[$pk]);
                    if ($published === '' && is_string($node[$pk])) $published = $node[$pk];
                    if ($published !== '') break;
                }
            }

            $videos[] = [
                'id' => $candidateId,
                'title' => $title !== '' ? $title : 'NCK WEALTH Short',
                'publishedAt' => $published,
                'thumbnail' => $thumb,
                'shortUrl' => 'https://www.youtube.com/shorts/' . $candidateId,
                'watchUrl' => 'https://www.youtube.com/watch?v=' . $candidateId,
                'embedUrl' => 'https://www.youtube.com/embed/' . $candidateId,
            ];
            $seen[$candidateId] = true;
        }
    }

    foreach ($node as $value) {
        if (is_array($value)) collect_shorts($value, $videos, $seen);
    }
}

function parse_yt_initial_data(string $html): ?array
{
    $start = strpos($html, 'var ytInitialData = ');
    if ($start === false) $start = strpos($html, 'ytInitialData = ');
    if ($start === false) return null;
    $start = strpos($html, '{', $start);
    if ($start === false) return null;
    $end = strpos($html, '</script>', $start);
    if ($end === false) return null;
    $json = trim(substr($html, $start, $end - $start));
    $json = preg_replace('/;\s*$/', '', $json);
    $data = json_decode($json, true);
    return is_array($data) ? $data : null;
}

try {
    $url = 'https://www.youtube.com/@' . rawurlencode($handle) . '/shorts?hl=en';
    [$status, $html, $error] = http_get($url);
    if ($status < 200 || $status >= 300 || $html === '') {
        throw new RuntimeException('youtube_shorts_page_failed (' . $status . ') ' . $error);
    }

    $data = parse_yt_initial_data($html);
    $videos = [];
    $seen = [];
    if ($data) collect_shorts($data, $videos, $seen);

    // Secondary fallback: pull obvious Shorts URLs from the page source and
    // use YouTube's public thumbnail endpoint. Titles are filled when nearby
    // JSON text contains them; this keeps the feed alive if renderer names
    // change again.
    if (!$videos && preg_match_all('~(?:/shorts/)([A-Za-z0-9_-]{11})~', $html, $matches)) {
        foreach (array_values(array_unique($matches[1])) as $id) {
            if (isset($seen[$id])) continue;
            $videos[] = [
                'id' => $id,
                'title' => 'NCK WEALTH Short',
                'publishedAt' => '',
                'thumbnail' => 'https://i.ytimg.com/vi/' . $id . '/hqdefault.jpg',
                'shortUrl' => 'https://www.youtube.com/shorts/' . $id,
                'watchUrl' => 'https://www.youtube.com/watch?v=' . $id,
                'embedUrl' => 'https://www.youtube.com/embed/' . $id,
            ];
        }
    }

    if (!$videos) throw new RuntimeException('no_shorts_found');

    $videos = array_slice($videos, 0, $maxResults);
    $result = ['generated_at' => time(), 'videos' => $videos];
    @file_put_contents($cacheFile, json_encode($result, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE), LOCK_EX);

    flock($lockFh, LOCK_UN);
    fclose($lockFh);
    respond(200, [
        'success' => true,
        'videos' => $videos,
        'cached' => false,
        'generated_at' => $result['generated_at'],
        'source' => 'youtube-shorts-page',
    ]);
} catch (Throwable $e) {
    error_log('NCK WEALTH YouTube Shorts feed error: ' . $e->getMessage());
    if ($gotLock && $lockFh) {
        flock($lockFh, LOCK_UN);
        fclose($lockFh);
    }
    if ($cached) respond_from_cache($cached, $maxResults, true);
    respond(502, ['success' => false, 'error' => 'fetch_failed', 'message' => 'Could not load the latest Shorts right now.']);
}
