    (function () {
        var umbraco;
    
        function FlowingTextController(scope, editorState) {
            var model = scope.control,
                ti, pi, 
                tab,
                prop,
                items = {},
                properties = [],
                watch,
                sourceProperty,
                sourcePropertySetting = model.editor.config.settings["source-property"];

            function alreadyRenderedFragments() {
                var sections = scope.model.value.sections,
                    section, si, row, ri, area, ai, control, ci,
                    fragments = 0;
                for (si = 0; si < sections.length; si++) {
                    section = sections[si];
                    for (ri = 0; ri < section.rows.length; ri++) {
                        row = section.rows[ri];
                        for (ai = 0; ai < row.areas.length; ai++) {
                            area = row.areas[ai];
                            for (ci = 0; ci < area.controls.length; ci++) {
                                control = area.controls[ci];
                                if (control === model) {
                                    return fragments;
                                }
                                if (control.editor.alias === model.editor.alias &&
                                    control.config["source-property"] === model.config["source-property"]) {
                                    fragments += control.config.fragments;
                                }
                            }
                        }
                    }
                }
                return fragments;
            }

            function updateFlow() {
                var elements,
                    begin = alreadyRenderedFragments(),
                    end = begin + model.config.fragments;
                if (!sourceProperty) {
                    return;
                }
                elements = $.grep($(sourceProperty.value), function(e) {
                    return !(e instanceof Text);
                });
                model.value =
                    $("<div>").append(
                        $(Array.prototype.slice.call(elements, begin, end || elements.length))
                    )
                    .html();
            }

            sourcePropertySetting.config = angular.extend(
                sourcePropertySetting.config,
                { items: items }
            );

            for (ti = 0; ti < editorState.current.tabs.length; ti++) {
                tab = editorState.current.tabs[ti];
                for (pi = 0; pi < tab.properties.length; pi++) {
                    prop = tab.properties[pi];
                    properties.push(prop);
                    items[prop.alias] = prop.label;
                }
            }

            if (!model.config) {
                model.config = {};
                scope.editGridItemSettings(model, 'control');
            }

            scope.$watch("control.config['fragments']", updateFlow);

            scope.$watch("control.config['source-property']", function() {
                if (model.config["source-property"]) {
                    sourceProperty = $.grep(properties, function(p) {
                        return p.alias === model.config["source-property"];
                    })[0];

                    if (watch) {
                        watch();
                    }

                    watch = scope.$watch(function() {
                        return sourceProperty.value;
                    }, updateFlow);
                }
            });
        }

        function initializeUmbraco() {
            try {
                umbraco = angular.module("umbraco");
            } catch (e) {
            }

            if (!umbraco) {
                umbraco = angular.module("umbraco", []);
            }
        }

        initializeUmbraco();
        umbraco.controller("our.umbraco.flowingtext.controller", [
            "$scope",
            "editorState",
            FlowingTextController
        ]);

    }());