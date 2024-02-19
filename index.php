<?php
include 'vendor/autoload.php';

echo \WebProfilerUi\Renderer::render(json_decode(file_get_contents('example/data/initial.json'), true), false);
