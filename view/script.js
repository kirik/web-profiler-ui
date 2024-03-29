(function () {
    let crc32 = {
        _table: null,
        _crc32GetTable: function () {
            if (this._table !== null) {
                return this._table;
            }
            var c;
            this._table = [];
            for (let n = 0; n < 256; n++) {
                c = n;
                for (var k = 0; k < 8; k++) {
                    c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
                }
                this._table[n] = c;
            }
            return this._table;
        },
        calc: function (str) {
            var crcTable = this._crc32GetTable();
            var crc = 0 ^ (-1);

            for (var i = 0; i < str.length; i++) {
                crc = (crc >>> 8) ^ crcTable[(crc ^ str.charCodeAt(i)) & 0xFF];
            }

            return (crc ^ (-1)) >>> 0;
        },
    };

    let colorizer = {
        _colors: [
            // https://onenumber.biz/blog-1/2020/8/25/tableau-color-palettes-with-many-colors-40
            // Tableau 216 Randomized
            '#999999', '#CCFF00', '#336600', '#00FFCC', '#CCFF66', '#009999', '#669933', '#6633FF', '#FF3366',
            '#993300', '#3399FF', '#CC6633', '#333366', '#CC66FF', '#006666', '#00FFFF', '#0033FF', '#336633',
            '#CC0066', '#CC6600', '#3333CC', '#CC0033', '#99FF99', '#CCFF33', '#CCCC66', '#660033', '#9966FF',
            '#006699', '#99FFCC', '#00FF66', '#FFCCCC', '#FF3399', '#FFCC66', '#FF0066', '#33FF00', '#000000',
            '#FF6699', '#66FFFF', '#339999', '#CC33FF', '#0066CC', '#FF33CC', '#99CCFF', '#CC3300', '#99CC99',
            '#009900', '#9966CC', '#CC9999', '#339933', '#000066', '#6600FF', '#006633', '#33FFFF', '#33CC99',
            '#00FF33', '#663333', '#330033', '#000033', '#9933CC', '#666600', '#669966', '#990033', '#66CC33',
            '#33FF99', '#666699', '#00CC99', '#00CCCC', '#FF9999', '#996699', '#660066', '#663300', '#00CC00',
            '#FFFF99', '#00CC33', '#330000', '#FF6666', '#CC00CC', '#66FF66', '#6600CC', '#FFFF00', '#9999FF',
            '#CC99CC', '#CC3399', '#66FF99', '#9933FF', '#FF99FF', '#99CC00', '#00CCFF', '#CC0099', '#CC3333',
            '#3366FF', '#33CCCC', '#66CCCC', '#3300CC', '#0033CC', '#6666CC', '#0066FF', '#996666', '#CCCCCC',
            '#99FF66', '#996600', '#669999', '#333333', '#FFFF66', '#9900FF', '#333399', '#33FF33', '#00FF00',
            '#003300', '#66FFCC', '#99CC33', '#CCFFFF', '#33FF66', '#33CC00', '#333300', '#FFFF33', '#66CC66',
            '#FFCC33', '#99CCCC', '#999900', '#CC0000', '#6666FF', '#FF66FF', '#666666', '#669900', '#66FF00',
            '#CC3366', '#3366CC', '#FF9933', '#3399CC', '#FF0000', '#FF33FF', '#FF9966', '#CC9900', '#FF00FF',
            '#CC99FF', '#0000FF', '#CC33CC', '#CCFFCC', '#CCCC00', '#99FFFF', '#003333', '#FF0099', '#CCCCFF',
            '#660000', '#33CCFF', '#FF3333', '#993399', '#3333FF', '#CC6699', '#993366', '#663366', '#990099',
            '#99CC66', '#CC66CC', '#FF9900', '#9900CC', '#006600', '#6699CC', '#CC9933', '#33FFCC', '#FF00CC',
            '#0000CC', '#33CC33', '#FFCC99', '#0099CC', '#993333', '#33CC66', '#6699FF', '#CCCC99', '#00CC66',
            '#FFFFCC', '#99FF33', '#009933', '#003399', '#00FF99', '#339966', '#666633', '#0099FF', '#330066',
            '#FF6600', '#339900', '#003366', '#990000', '#999966', '#FF6633', '#990066', '#FF66CC', '#999933',
            '#3300FF', '#FFCC00', '#CCFF99', '#009966', '#66FF33', '#CC6666', '#9999CC', '#66CC00', '#FF99CC',
            '#FFCCFF', '#000099', '#CC00FF', '#CC9966', '#663399', '#660099', '#336666', '#CCCC33', '#66CC99',
            '#336699', '#996633', '#99FF00', '#6633CC', '#330099', '#66CCFF', '#FF3300', '#FF0033',
        ],
        getColor: function (str) {
            return this._colors[crc32.calc(str) % this._colors.length];
        },
    };

    let self = {
        defaultIframeHeightPx: 250,
        minimizedIframeHeightPx: 45,
        lsPoppedOut: '__profilerPoppedOut',
        lsIframeSize: '__profilerIframeSize',
        lsPreselectedTab: '__profilerPreselectedTab',
        dom: {
            currentDocument: null,
            profilerContainer: null,
            parentPageIframeContainer: null,
            parentPageIframe: null,
            renderIframe: function (css, innerDoc) {
                localStorage.removeItem(self.lsPoppedOut);

                this.profilerContainer = innerDoc;
                // render on page
                this.parentPageIframe.contentDocument.head.innerHTML = `<style>${css}</style>`;
                this.parentPageIframe.contentDocument.body.appendChild(innerDoc);
                this.parentPageIframeContainer.style.display = 'block';
                var iframeHeight = parseInt(localStorage.getItem(self.lsIframeSize)) || self.defaultIframeHeightPx;
                this.parentPageIframeContainer.style.height = iframeHeight + 'px';
                document.body.style.marginBottom = iframeHeight + 'px';

                innerDoc.getElementsByClassName('header-ctrl-pop-out')[0].onclick = function () {
                    document.body.style.marginBottom = '0px';
                    self.dom.getWindow(css, innerDoc);
                };
                innerDoc.getElementsByClassName('header-ctrl-minimize')[0].onclick = function () {
                    if (parseInt(self.dom.parentPageIframeContainer.style.height) === parseInt(self.minimizedIframeHeightPx)) {
                        self.dom.parentPageIframeContainer.style.height = self.defaultIframeHeightPx + 'px';
                    } else {
                        self.dom.parentPageIframeContainer.style.height = self.minimizedIframeHeightPx + 'px';
                    }
                };
                this.currentDocument = this.parentPageIframe.contentDocument;
                return innerDoc;
            },
            render: function (css) {
                if (parseInt(localStorage.getItem(self.lsPoppedOut)) !== 1) {
                    this.renderIframe(css, document.getElementById('__web_profiler_container'));
                } else {
                    this.getWindow(css, document.getElementById('__web_profiler_container'));
                }
            },
            getWindow: function (css, innerDoc) {
                this.parentPageIframeContainer.style.display = 'none';
                var winProps = [
                    'toolbar=no',
                    'location=no',
                    'directories=no',
                    'status=no',
                    'menubar=no',
                    'scrollbars=no',
                    'resizable=yes',
                    'width=1280,height=600',
                    // 'top=' + (screen.height - 550) + ',left=' + (screen.width - 1200)
                ];
                var popOutWindow = window.open('', 'web_profiler_window', winProps.join(','));
                if (!popOutWindow) {
                    console.log('Could not open profiler in external window, embedding as iframe');
                    self.dom.renderIframe(css, innerDoc);
                    return false;
                }
                document.body.style.marginBottom = '0px';
                if (!popOutWindow.parentPagePlaceholder) {
                    popOutWindow.document.head.innerHTML = `<title>WEB Profiler</title>
                    <style>
                        #__web_profiler_container .header .header-ctrl a.header-ctrl-pop-out,
                        #__web_profiler_container .header .header-ctrl a.header-ctrl-minimize {display: none}
                        ${css}
                    </style>`;
                    popOutWindow.document.body.appendChild(innerDoc);

                    localStorage.setItem(self.lsPoppedOut, 1);
                }
                popOutWindow.parentPagePlaceholder = this.parentPageIframe;
                popOutWindow.onbeforeunload = function () {
                    self.dom.renderIframe(css, popOutWindow.document.getElementById('__web_profiler_container'));
                };
                this.profilerContainer = popOutWindow.document;
                this.currentDocument = popOutWindow.document;
            },
            getContainer: function () {
                return this.profilerContainer;
            },
            getRequests: function () {
                return this.getContainer().getElementsByClassName('requests')[0];
            },
            getCollectorTabs: function () {
                return this.getContainer().getElementsByClassName('header-tabs')[0];
            },
            getCollectorData: function () {
                return this.getContainer().getElementsByClassName('collector-data')[0];
            },
        },
        init: function (initJson) {
            var origOpen = XMLHttpRequest.prototype.open;
            XMLHttpRequest.prototype.open = function () {
                this.addEventListener('load', function () {
                    try {
                        let json = JSON.parse(this.responseText);
                        if (json['__profiler']) {
                            self.addRequest(json['__profiler'], false);
                        }
                    } catch (e) {
                        // do nothing
                    }
                });
                origOpen.apply(this, arguments);
            };

            this.dom.parentPageIframeContainer = document.getElementById('__profiler_iframe_container');
            this.dom.parentPageIframe = this.dom.parentPageIframeContainer.getElementsByTagName('iframe')[0];

            let observer = new ResizeObserver(function (mutations) {
                let height = Math.max(parseInt(self.dom.parentPageIframeContainer.style.height), self.minimizedIframeHeightPx);
                if (height) {
                    document.body.style.marginBottom = height + 'px';
                    localStorage.setItem(self.lsIframeSize, height + 'px');

                    // setTimeout to avoid observer loop
                    setTimeout(function () {
                        if (height > self.minimizedIframeHeightPx) {
                            self.dom.parentPageIframeContainer.style.overflowX = 'scroll';
                            self.dom.parentPageIframeContainer.style.resize = 'vertical';
                            self.dom.getRequests().style.overflowY = 'auto';
                        } else {
                            self.dom.parentPageIframeContainer.style.overflowX = 'hidden';
                            self.dom.parentPageIframeContainer.style.resize = 'none';
                            self.dom.getRequests().style.overflowY = 'hidden';
                        }
                    }, 0);
                }
            });
            observer.observe(this.dom.parentPageIframeContainer);

            if (typeof InstallTrigger !== 'undefined') {
                // firefox condition https://stackoverflow.com/questions/16381648/behavior-of-iframe-contentdocument-in-chrome-and-firefox
                this.dom.parentPageIframe.onload = function () {
                    self.dom.render(initJson.css);
                    self.addRequest(initJson.data, true);
                };
            } else {
                this.dom.render(initJson.css);
                this.addRequest(initJson.data, true);
            }
        },
        addRequest: function (requestData, selectByDefault = true) {
            var collTimeSum = 0;
            for (let i in requestData['collectors_data']) {
                collTimeSum += requestData['collectors_data'][i]['duration'];
            }
            var timingsHtml = '';
            for (let i in requestData['collectors_data']) {
                let collectorData = requestData['collectors_data'][i];
                let color = this.getCollectorColor(collectorData['props']);
                let widthPrc = Math.round(collectorData['duration'] / collTimeSum * 10000) / 100;
                timingsHtml += '<div style="background-color: ' + color + ';  width: ' + widthPrc + '%"></div>';
            }
            var reqItem = document.createElement('a');
            reqItem.requestData = requestData;
            reqItem.classList.add('request');
            reqItem.innerHTML =
                '<div class="uri">' +
                '<span class="ellipsis">' + requestData['request_uri'] + '</span>' +
                '<div class="stat">' +
                this.view.formatSeconds(requestData['duration']) + " / " +
                this.view.formatBytes(requestData['peak_memory']) +
                '</div>' +
                '</div>' +
                '<div class="timing">' + timingsHtml + '</div>';
            this.dom.getRequests().prepend(reqItem);
            for (let item of this.dom.getRequests().getElementsByTagName('a')) {
                item.onclick = this.selectRequest;
            }
            if (selectByDefault) {
                reqItem.click();
            }
        },
        selectRequest: function (e) {
            e.preventDefault();
            for (let item of self.dom.getRequests().getElementsByClassName('active')) {
                item.classList.remove('active');
            }
            this.classList.add('active');
            self.dom.getCollectorTabs().innerHTML = '';
            self.dom.getCollectorData().innerHTML = '';
            self.addCollectors(this.requestData);
        },
        getCollectorTab: function (collectorData) {
            var tagA = document.createElement('a');
            tagA.collectorData = collectorData;
            tagA.innerHTML = collectorData['props']['title'] + ' <sup>' + tagA.collectorData['data'].length + '</sup>';
            tagA.href = '#';
            tagA.style.borderTop = '3px solid ' + this.getCollectorColor(collectorData['props']);
            tagA.onclick = function (e) {
                e.preventDefault();
                self.selectTab(this);
            };
            return tagA;
        },
        getCollectorColor: function (collectorProps) {
            return ('cssColor' in collectorProps) ? collectorProps['cssColor'] : colorizer.getColor(collectorProps['title']);
        },
        addCollectors: function (requestData) {
            var summaryData = [];
            for (let i in requestData['collectors_data']) {
                let collectorData = requestData['collectors_data'][i];
                let tagA = this.getCollectorTab(collectorData);
                tagA.id = 'tab_' + i;
                // prepare Summary
                this.dom.getCollectorTabs().appendChild(tagA);
                for (let i in collectorData['data']) {
                    let dataRow = collectorData['data'][i];
                    if (('__start_time' in dataRow) && ('__duration' in dataRow)) {
                        summaryData.push({
                            'start_time': dataRow['__start_time'],
                            'duration': dataRow['__duration'],
                            'tab': tagA,
                            'tabIndex': i,
                            'color': this.getCollectorColor(collectorData['props']),
                        });
                    }
                }
            }

            summaryData.sort(function (a, b) {
                return a.start_time - b.start_time;
            });
            let summaryTab = this.getCollectorTab({
                'props': {
                    'title': 'Summary',
                    'cssColor': 'white',
                    'template': 'summary',
                },
                'start_time': requestData['start_time'],
                'duration': requestData['duration'],
                'data': summaryData
            });
            summaryTab.id = 'tab-summary';

            this.dom.getCollectorTabs().appendChild(summaryTab);

            let preSelectedTab = this.dom.currentDocument.getElementById(localStorage.getItem(this.lsPreselectedTab) + '');
            if (preSelectedTab) {
                preSelectedTab.click();
            } else {
                // select summary tab by default
                summaryTab.click();
            }
        },
        selectTab: function (tabElement, goToIndex = null) {
            for (let item of self.dom.getCollectorTabs().getElementsByClassName('active')) {
                item.classList.remove('active');
            }
            tabElement.classList.add('active');
            self.renderCollector(tabElement.collectorData, goToIndex);
            if (goToIndex === null) {
                localStorage.setItem(self.lsPreselectedTab, tabElement.id);
            }
        },
        renderCollector: function (collectorData, goToIndex) {
            this.dom.getCollectorData().replaceChildren(this.view.templates[collectorData['props']['template']](collectorData, goToIndex));
        },
        view: {
            formatSeconds: function (seconds, decimals = 2) {
                if (seconds > 60) {
                    return Math.round(seconds / 60) + 'm';
                }
                if (seconds >= 1) {
                    return seconds.toFixed(decimals) + 's';
                }
                if (seconds > 0.001) {
                    return Math.round(seconds * 1000) + 'ms';
                }
                return Math.round(seconds * 1000000) + 'μs';
            },
            formatBytes: function (bytes, decimals = 2) {
                if (!+bytes) {
                    return '0B';
                }

                const k = 1024;
                const dm = decimals < 0 ? 0 : decimals;
                const sizes = ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];

                const i = Math.floor(Math.log(bytes) / Math.log(k));

                return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))}${sizes[i]}`;
            },
            formatUnixtime: function (unixtime) {
                var date = new Date(parseInt(unixtime) * 1000);
                return date.toLocaleTimeString();
            },
            templates: {
                summary: function (collectorData, goToIndex) {
                    let container = document.createElement('div');
                    container.classList.add('collector-data-summary');

                    let waterfall = document.createElement('div');
                    waterfall.classList.add('waterfall');

                    let reqTime = document.createElement('div');
                    reqTime.classList.add('request-time');
                    reqTime.textContent = self.view.formatSeconds(collectorData['duration']);
                    waterfall.appendChild(reqTime);

                    for (let i in collectorData['data']) {
                        let metricRow = collectorData['data'][i];
                        let step = document.createElement('div');
                        step.classList.add('step');
                        let marginLeft = ((metricRow['start_time'] - collectorData['start_time']) / collectorData['duration']) * 100;
                        let fillPrc = marginLeft + (metricRow['duration'] / collectorData['duration'] * 100);
                        step.style.paddingLeft = fillPrc + '%';
                        step.style.background = 'linear-gradient(to right, transparent ' + marginLeft + '%, ' + metricRow['color'] + ' ' + marginLeft + '%, ' + metricRow['color'] + ' ' + fillPrc + '%, transparent ' + fillPrc + '%)';
                        step.innerHTML = '&nbsp;' + self.view.formatSeconds(metricRow['duration']);
                        step.onclick = function () {
                            self.selectTab(metricRow['tab'], metricRow['tabIndex']);
                        };
                        waterfall.appendChild(step);
                    }
                    container.appendChild(waterfall);
                    return container;
                },
                html: function (collectorData, goToIndex) {
                    var collectorMetrics = collectorData['props']['metrics'];
                    let container = document.createElement('div');
                    container.classList.add('collector-data-html');
                    for (let i in collectorData['data']) {
                        let metricRow = collectorData['data'][i];
                        for (let metricId in collectorMetrics) {
                            if (metricId in metricRow) {
                                let header = document.createElement('h2');
                                header.textContent = collectorMetrics[metricId]['title'];
                                container.appendChild(header);
                                let content = document.createElement('div');
                                content.innerHTML = metricRow[metricId];
                                container.appendChild(content);
                            }
                        }
                    }
                    return container;
                },
                table: function (collectorData, goToIndex) {
                    var sortTable = function (th, tBody) {
                        var colIndex = Array.prototype.indexOf.call(th.parentNode.children, th);
                        var sortDir, doSwap, swapCount = 0;
                        var swapping = true;
                        // sortDir: 1 asc, -1 desc, 0 default
                        if (th.style.cursor === 'n-resize') {
                            sortDir = 1;
                            th.style.cursor = 's-resize';
                        } else if (th.style.cursor === 's-resize') {
                            sortDir = 0;
                            th.style.cursor = 'ns-resize';
                        } else {
                            sortDir = -1;
                            th.style.cursor = 'n-resize';
                        }
                        let rows = tBody.rows;
                        while (swapping) {
                            swapping = false;
                            var i;
                            for (i = 0; i < (rows.length - 1); i++) {
                                doSwap = false;

                                if (sortDir === 0) {
                                    let a = rows[i];
                                    let b = rows[i + 1];
                                    if (a.sortValue > b.sortValue) {
                                        doSwap = true;
                                        break;
                                    }
                                } else {
                                    let a = rows[i].getElementsByTagName('td')[colIndex];
                                    let b = rows[i + 1].getElementsByTagName('td')[colIndex];
                                    if (sortDir === 1) {
                                        if (a.sortValue > b.sortValue) {
                                            doSwap = true;
                                            break;
                                        }
                                    } else if (sortDir === -1) {
                                        if (a.sortValue < b.sortValue) {
                                            doSwap = true;
                                            break;
                                        }
                                    }
                                }
                            }
                            if (doSwap) {
                                rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
                                swapping = true;
                                swapCount++;
                            }
                        }
                    };

                    var collectorMetrics = collectorData['props']['metrics'];

                    // render tHead
                    let tHead = document.createElement('thead');
                    let tBody = document.createElement('tbody');

                    // render tBody
                    var txtDuplicates = {};
                    var metricSums = {
                        sums: {},
                        add: function (metricId, value) {
                            if (!(metricId in this.sums)) {
                                this.sums[metricId] = 0;
                            }
                            this.sums[metricId] += value;
                        },
                        getSum: function (metricId) {
                            return this.sums[metricId];
                        },
                        hasData: function () {
                            return Object.keys(this.sums).length > 0;
                        }
                    };
                    for (let i in collectorData['data']) {
                        let metricData = collectorData['data'][i];
                        let tr = document.createElement('tr');
                        tr.sortValue = i;
                        tBody.appendChild(tr);
                        for (let metricId in collectorMetrics) {
                            let metricProps = collectorMetrics[metricId];
                            var txtValue = '-';
                            var cleanValue = 0;
                            var tdClass = {
                                classList: [],
                                checkThreshold: function (value, min, max) {
                                    if ((typeof max !== 'undefined') && value >= max) {
                                        this.add('threshold-max');
                                    } else if ((typeof min !== 'undefined') && value >= min) {
                                        this.add('threshold-min');
                                    }
                                },
                                add: function (className) {
                                    this.classList.push(className);
                                }
                            };
                            if (metricId in metricData) {
                                if (metricId === '__start_time' || metricId === '__duration') {
                                    continue;
                                }
                                let td = document.createElement('td');
                                let metricValue = metricData[metricId];
                                switch (metricProps['type']) {
                                    case 'seconds':
                                        cleanValue = parseFloat(metricValue);
                                        txtValue = self.view.formatSeconds(cleanValue);
                                        tdClass.checkThreshold(cleanValue, metricProps['thresholdMin'], metricProps['thresholdMax']);
                                        metricSums.add(metricId, cleanValue);
                                        td.textContent = txtValue;
                                        break;
                                    case 'bytes':
                                        cleanValue = parseFloat(metricValue);
                                        txtValue = self.view.formatBytes(cleanValue);
                                        tdClass.checkThreshold(cleanValue, metricProps['thresholdMin'], metricProps['thresholdMax']);
                                        metricSums.add(metricId, cleanValue);
                                        td.textContent = txtValue;
                                        break;
                                    case 'unixtime':
                                        cleanValue = parseInt(metricValue);
                                        txtValue = self.view.formatUnixtime(cleanValue);
                                        tdClass.checkThreshold(cleanValue, metricProps['thresholdMin'], metricProps['threshholdMax']);
                                        td.textContent = txtValue;
                                        break;
                                    case 'integer':
                                        cleanValue = txtValue = parseInt(metricValue);
                                        tdClass.checkThreshold(cleanValue, metricProps['thresholdMin'], metricProps['threshholdMax']);
                                        metricSums.add(metricId, cleanValue);
                                        td.textContent = txtValue;
                                        break;
                                    case 'json':
                                        td.innerHTML = this._jsonSyntaxHighlight(JSON.stringify(JSON.parse(metricValue), undefined, 2));
                                        tdClass.add('json');
                                        cleanValue = 0; // no sorting in code
                                        break;
                                    case 'text':
                                        tdClass.add('text');
                                        txtValue = metricValue.toString();
                                        if (txtDuplicates[txtValue]) {
                                            // adding to first occurrence also
                                            txtDuplicates[txtValue].classList.add('threshold-dup');
                                            tdClass.add('threshold-dup');
                                        } else {
                                            txtDuplicates[txtValue] = td;
                                        }

                                        cleanValue = txtValue.toLowerCase().substring(0, 32);

                                        td.ondblclick = function (e) {
                                            e.preventDefault();
                                            var idoc = self.dom.parentPageIframe.contentDocument
                                                || self.dom.parentPageIframe.contentWindow.document;
                                            var iwin = self.dom.parentPageIframe.contentWindow
                                                || self.dom.parentPageIframe.contentDocument.defaultView;

                                            var r = idoc.createRange();
                                            r.selectNode(this);
                                            iwin.getSelection().removeAllRanges();
                                            iwin.getSelection().addRange(r);
                                            idoc.execCommand('copy');
                                            iwin.getSelection().removeAllRanges();
                                        };
                                        td.textContent = txtValue;
                                        break;
                                    case 'string':
                                    default:
                                        txtValue = metricValue.toString();
                                        cleanValue = txtValue.toLowerCase().substring(0, 32);
                                        td.textContent = txtValue;
                                }
                                td.sortValue = cleanValue;
                                for (let i in tdClass.classList) {
                                    td.classList.add(tdClass.classList[i]);
                                }
                                tr.appendChild(td);
                            }
                        }
                    }


                    let trHead = document.createElement('tr');
                    tHead.appendChild(trHead);
                    for (let metricId in collectorMetrics) {
                        if (metricId === '__start_time' || metricId === '__duration') {
                            continue;
                        }
                        let metricProps = collectorMetrics[metricId];
                        let th = document.createElement('th');
                        th.textContent = metricProps['title'];
                        th.style.cursor = 'ns-resize';
                        th.onclick = function (e) {
                            sortTable(this, tBody);
                        };
                        trHead.appendChild(th);
                    }

                    if (metricSums.hasData()) {
                        let trHeadSums = document.createElement('tr');
                        tHead.appendChild(trHeadSums);
                        for (let metricId in collectorMetrics) {
                            if (metricId === '__start_time' || metricId === '__duration') {
                                continue;
                            }
                            let metricProps = collectorMetrics[metricId];
                            let th = document.createElement('th');
                            let cleanValue = metricSums.getSum(metricId) || '';
                            switch (metricProps['type']) {
                                case 'seconds':
                                    th.textContent = self.view.formatSeconds(cleanValue);
                                    break;
                                case 'bytes':
                                    th.textContent = self.view.formatBytes(cleanValue);
                                    break;
                                default:
                                    th.textContent = cleanValue.toString();
                            }
                            trHeadSums.appendChild(th);
                        }
                    }

                    let tableContainer = document.createElement('div');
                    tableContainer.classList.add('collector-data-table');
                    tableContainer.classList.add('tableFixHead');
                    let table = document.createElement('table');
                    table.appendChild(tHead);
                    table.appendChild(tBody);
                    tableContainer.appendChild(table);

                    if (goToIndex !== null) {
                        setTimeout(function () {
                            tBody.rows[goToIndex].scrollIntoView({block: "start", behavior: "smooth"});
                            tBody.rows[goToIndex].style.backgroundColor = '#95ff8d';
                        }, 0);
                    }

                    return tableContainer;
                },
                _jsonSyntaxHighlight: function (json) {
                    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
                        var cls = 'number';
                        if (/^"/.test(match)) {
                            if (/:$/.test(match)) {
                                cls = 'key';
                            } else {
                                cls = 'string';
                            }
                        } else if (/true|false/.test(match)) {
                            cls = 'boolean';
                        } else if (/null/.test(match)) {
                            cls = 'null';
                        }
                        return '<span class="' + cls + '">' + match + '</span>';
                    });
                },
            },
        },
    };

    // initJson comment will be replaced with `const initJson = {...};` by adapters
    /*!initJson*/
    self.init(initJson);

    return self;
})();
