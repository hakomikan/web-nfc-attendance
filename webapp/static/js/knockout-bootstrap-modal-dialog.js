var wna = (function(wna) {
    wna.addHiddenDivToBody = function() {
        var div = document.createElement("div");
        div.style.display = "none";
        document.body.appendChild(div);
        return div;
    };

    wna.createModalElement = function(templateName, viewModel) {
        var temporaryDiv = wna.addHiddenDivToBody();
        var deferredElement = $.Deferred();
        ko.renderTemplate(
            templateName,
            viewModel, {
                afterRender: function(nodes) {
                    var elements = nodes.filter(function(node) {
                        return node.nodeType === 1;
                    });
                    deferredElement.resolve(elements[0]);
                }
            },
            temporaryDiv,
            "replaceNode"
        );
        return deferredElement;
    };

    wna.showTwitterBootstrapModal = function($ui) {
        $ui.modal({
            backdrop: "static",
            keyboard: false
        });
    };

    wna.whenModalResultCompleteThenHideUI = function(deferredModalResult, $ui) {
        deferredModalResult.always(function() {
            $ui.modal("hide");
        });
    };

    wna.whenUIHiddenThenRemoveUI = function($ui) {
        $ui.on("hidden", function() {
            $ui.each(function(index, element) {
                ko.cleanNode(element);
            });
            $ui.remove();
        });
    };

    wna.addModalHelperToViewModel = function(viewModel, deferredModalResult, context) {
        viewModel.modal = {
            close: function(result) {
                if (typeof result !== "undefined") {
                    deferredModalResult.resolveWith(context, [result]);
                } else {
                    deferredModalResult.rejectWith(context, []);
                }
            }
        };
    };

    wna.showModal = function(options) {
        if (typeof options === "undefined") throw new Error("An options argument is required.");
        if (typeof options.viewModel !== "object") throw new Error("options.viewModel is required.");

        var viewModel = options.viewModel;
        var template = options.template || viewModel.template;
        var context = options.context;

        if (!template) throw new Error("options.template or options.viewModel.template is required.");

        return wna.createModalElement(template, viewModel)
            .pipe($) // jQueryify the DOM element
            .pipe(function($ui) {
                var deferredModalResult = $.Deferred();
                wna.addModalHelperToViewModel(viewModel, deferredModalResult, context);
                wna.showTwitterBootstrapModal($ui);
                wna.whenModalResultCompleteThenHideUI(deferredModalResult, $ui);
                wna.whenUIHiddenThenRemoveUI($ui);
                return deferredModalResult;
            });
    };

    return wna;
})({});
