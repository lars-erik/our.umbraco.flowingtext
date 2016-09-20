/// <reference path="../../../Umbraco/lib/jquery/jquery.min.js" />
/// <reference path="/Umbraco/lib/angular/1.1.5/angular.js" />
/// <reference path="/Umbraco/lib/angular/1.1.5/angular-mocks.js" />
/// <reference path="../flowingtext.js" />
(function () {

    describe("Flowing text grid editor", function () {

        var rootScope,
            scope,
            controllerFactory,
            defaultEditorState = {
                current: {
                    tabs: [
                        {
                            alias: "Content",
                            properties: [
                                {
                                    alias: "bodyText",
                                    label: "Body text"
                                }
                            ]
                        },
                        {
                            alias: "Layout",
                            properties: [
                                {
                                    alias: "content",
                                    label: "Content"
                                }
                            ]
                        }
                    ]
                }
            },
            model = {
                "editor": {
                    "alias": "flowingText",
                    "config": {
                        "settings": {
                            "source-property": {
                                "label": "Source property",
                                "key": "source-property",
                                "description": "The source for the text",
                                "view": "/umbraco/views/propertyeditors/dropdown/dropdown.html",
                                "config": {
                                    "items": {
                                    }
                                }
                            },
                            "fragments": {
                                "label": "Fragments to show",
                                "key": "fragments",
                                "description": "How many paragraphs or fragments to show",
                                "view": "/umbraco/views/propertyeditors/integer/integer.html",
                                "config": {

                                }
                            }
                        }
                    }
                }
            },
            gridModel = {
                value: {
                    sections: [
                        {
                            rows: [
                                {
                                    areas: [
                                        {
                                            controls: [
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            }
            editGridItemSettings = function () { };

        beforeEach(module("umbraco"));
        beforeEach(
            inject(function ($controller, $rootScope) {
                controllerFactory = $controller;
                rootScope = $rootScope;
                rootScope.editGridItemSettings = editGridItemSettings;
                rootScope.model = gridModel;
                scope = rootScope.$new();
                scope.control = angular.extend({}, model);
                controllerFactory("our.umbraco.flowingtext.controller", {
                    "$scope": scope,
                    "editorState": angular.extend({}, defaultEditorState)
                });
            })
        );

        it("populates the source property options with the properties of the document", function () {

            var sourcePropertySetting = scope.control.editor.config.settings["source-property"];

            expect(sourcePropertySetting.config.items).toEqual({
                "bodyText": "Body text",
                "content": "Content"
            });

        });

        it("sets the value when a source property is selected", function () {
            var expectedText = "<p>The expected value</p>",
                initialText = "<p>Unexpected value</p>",
                property = defaultEditorState.current.tabs[0].properties[0];

            property.value = initialText;

            scope.control.config = {
                "source-property": "bodyText"
            };
            scope.$digest();

            // we have to do double digest here to simulate update to the text
            property.value = expectedText;
            scope.$digest();

            expect(scope.control.value).toBe(expectedText);
        });

        it("gets a limited amount of fragments", function () {
            var expectedText =
                    "<h1>Expected header</h1>" +
                    "<p>The expected value</p>",
                allText =
                    expectedText +
                    "<p>Unexpected value</p>",
                property = defaultEditorState.current.tabs[0].properties[0];

            property.value = allText;

            scope.control.config = {
                "source-property": "bodyText",
                "fragments": 2
            };
            scope.$digest();

            expect(scope.control.value).toBe(expectedText);
        });

        it("gets the fragments remaining from the previous ones", function() {
            var expectedText =
                    "<p>Expected paragraph</p>" +
                    "<p>Another expected paragraph</p>",
                allText =
                    "<h1>Unexpected header</h1>" +
                    expectedText +
                    "<p>Unexpected value</p>",
                property = defaultEditorState.current.tabs[0].properties[0];

            property.value = allText;

            scope.control.config = {
                "source-property": "bodyText",
                "fragments": 2
            };

            gridModel.value.sections[0].rows[0].areas[0].controls = [
                {
                    editor: {
                        alias: "flowingText"
                    },
                    config: {
                        "source-property": "bodyText",
                        fragments: 1
                    }
                },
                scope.control
            ];

            scope.$digest();

            expect(scope.control.value).toBe(expectedText);
        });

    });

}());

