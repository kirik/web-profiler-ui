<?php

namespace Kirik\WebProfilerUi;

class Renderer
{
    public static function render(array $data, bool $minify): string
    {
        $js = str_replace(
            '/*!initJson*/',
            'const initJson = ' . json_encode(['css' => self::_getCss($minify), 'data' => $data]) . ';',
            self::_getJs($minify)
        );
        $html = str_replace('/*!script*/', $js, self::_getHtml($minify));
        return $html;
    }

    protected static function _getCss(bool $minify): string
    {
        return self::_getFileContent('style' . ($minify ? '.min' : '') . '.css');
    }

    protected static function _getJs(bool $minify): string
    {
        return self::_getFileContent('script' . ($minify ? '.min' : '') . '.js');
    }

    protected static function _getHtml(): string
    {
        return self::_getFileContent('template.html');
    }

    protected static function _getFileContent(string $fileName): string
    {
        return file_get_contents(__DIR__ . '/../view/' . $fileName);
    }
}
