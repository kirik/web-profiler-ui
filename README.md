# WEB Profiler UI

Created to simplify the process of searching for bottlenecks in web
projects. [Click here](http://kirik.github.io/web-profiler-ui/) to see it in action.

## Features

- Backend-independent design: can be used with any backend (PHP, Golang, Node.js, Java, ...)
    - PHP `supported` (please refer to the [library](https://github.com/kirik/web-profiler-php))
    - Golang `in development`
    - For others, please don't hesitate to PR an adapter for your programming language
- [Docked mode](#docked-mode)
- [Floating window mode](#floating-window-mode)
- Waterfall span view
- AJAX requests support
- Small footprint
- No dependencies: written with vanilla JS, CSS, and HTML
- Stateful with localStorage (remembers docking/floating mode, folding, and size)
- Go to row from Summary view (just click on span)

### Floating window mode

![Floating window mode](doc/floating_mode.png "Floating window mode")

### Docked mode

![Docked mode](doc/docked_mode.png "Docked mode")

## Build&Run

You don't need to run anything just to play with the profiler. Please see
the [playground](http://kirik.github.io/web-profiler-ui/).

If you'd like to run the project locally:

1. Clone this project

```shell
git clone git@github.com:kirik/web-profiler-ui.git && cd web-profiler-ui
```

2. Run any HTTP server to open `index.html`:

**Python**

```shell
python3 -m http.server
```

**PHP**

```shell
php -S localhost:8000
```

**IntelliJ IDEs**

You can run the project with your IntelliJ IDE using the embedded web server. Just open `index.html` and click on
your favorite browser icon in the browser toolbar:
![intellij_run.png](doc/intellij_run.png)

## Internals

Profiler is embedded using an iframe just to avoid CSS collisions with the parent page.

- [script.js](view%2Fscript.js) contains all JS used to render profiling data
- [style.css](view%2Fstyle.css) contains the main CSS for the profiler
- [template.html](view%2Ftemplate.html) is the main template file

Backends should send an appropriate response to be parsed by the profiler and draw spans:

```json
{
  // (string) URI
  "request_uri": "/uri/requested/",
  // (int) overall memory used by the request in bytes
  "peak_memory": 0,
  // (array) collectors objects, see `Collector object`
  "collectors_data": [],
  // (float) Unix timestamp with microseconds
  "start_time": 1708231434.391469,
  // (float) overall time used to respond in seconds (with microseconds)
  "duration": 0.39930295944213867,
  // Not Implemented Yet
  "request_headers": [],
  // Not Implemented Yet
  "response_headers": []
}
```

**Collector object**

```json
{
  "props": {
    // (string, required) title to show in the profiler's tab
    "title": "Log",
    // (string, required) template for collector's data to display; available templates:
    //    - `table`: data will be displayed as a table
    //    - `html`: data will be shown as HTML
    "template": "table",
    // (string, optional) color associated with this collector
    //    - can be either hex `#af0000`, `rgb(255,0,0)` or color name `gold`
    //    - if no color is specified, a predefined color will be associated (by CRC32 from `title` and a 216-color palette)
    "cssColor": "#663333",
    // (float, required) summary time for this collector 
    "duration": 0,
    // (object, required) list of metrics, which this collector is collecting
    "metrics": {
      // (string, required) metric key (unique in metrics context)
      "key": {
        // (string, required) metric title, which will be displayed
        "title": "Title",
        // (string, required) metric data type - different types have their own format logic:
        //    - `seconds` - will be formatted as Xs/Xms/Xμs
        //    - `bytes` - will be formatted as XB/XKiB/XMiB/...
        //    - `unixtime` - will be formatted as time (for example: 23:43:54) 
        //    - `integer` - will be formatted as a number
        //    - `json` - 
        //    - `text` - long texts (such as SQL queries)
        //        For `table` template, the following features are available:
        //          text will be truncated with ellipses (using CSS);
        //          duplicated values will be highlighted;
        //          copy the full content on double click;
        //    - `string` (default) - just a string value, will not be truncated as opposed to `text` type
        "type": "type"
      },
      // `__start_time` and `__duration` are standard metrics which will be used to generate the Summary tab
      // with spans waterfall. You can skip these metrics to not display the collector in the Summary tab
      "__start_time": {
        "title": "Start time",
        "type": "seconds"
      },
      "__duration": {
        "title": "Duration",
        "type": "seconds"
      }
    }
  },
  "data": [
    {
      "message": "\"test\"",
      "file_line": "\/var\/www\/html\/App\/Dbg\/Controller\/Index.php:362",
      "time": 1708231434
    }
  ]
}
```

To render AJAX responses, they should provide a full response with the `__profiler` property along with business data:

```json
{
  ...,
  "__profiler": {
    /*full profiler response*/
  }
}
```

I'm avoiding using HTTP headers to send profiler data with AJAX as it requires special settings for HTTP servers. I also
don't like to save responses to files to use them later, as it requires a writable filesystem and other file-related
logic (be KISS).

### Adapters

An adapter is a small piece of language-related code (aka interface) to connect the UI to the web project. Supported
adapters:

- PHP ([library](https://github.com/kirik/web-profiler-php))
- Golang (WIP)

## Developing

[Makefile](Makefile) is used just to minify CSS and JS after editing.

### [PHP adapter](adapters/Renderer.php)

Please initialize Composer with the command

```shell
composer dumpautoload
```

and then open [index.php](index.php).

## Roadmap

1. [x] create playground
2. [ ] add php library
3. [ ] add golang adapter and library
4. [ ] add dark mode
