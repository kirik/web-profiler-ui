<?php

namespace Kirik\WebProfilerUi;

class Renderer
{
    public static function render(array $data, bool $minify): string
    {
        $js = str_replace('/**initJson**/', json_encode(['css' => self::_getCss(), 'data' => $data]), self::_getJs());
        $html = str_replace('/**script**/', $js, self::_getHtml());
        if ($minify) {
            $html = preg_replace("#//.+$#m", '', $html);
            $html = preg_replace("/(\s{2,}|\n)/", '', $html);
        }
        return $html;
    }

    protected static function _getCss(): string
    {
        return file_get_contents(__DIR__ . '/../view/style.css');
    }

    protected static function _getJs(): string
    {
        return file_get_contents(__DIR__ . '/../view/script.js');
    }

    protected static function _getHtml(): string
    {
        return file_get_contents(__DIR__ . '/../view/template.html');
    }
}
