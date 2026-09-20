<?php
if (!defined("NCK_APP")) { http_response_code(403); exit("Forbidden"); }
return [
  "channel_handle" => "NCKWEALTH",
  "short_results" => 4,
  "long_results" => 4,
  "cache_ttl_seconds" => 300,
];
