var frameModule = require("ui/frame");
var dialogs = require("ui/dialogs");

var eghlViewModel = require("../eghl-view-model").eghlViewModel;

exports.loaded = function(args) {
    var page = args.object;

    var viewModel = eghlViewModel(args);
    page.bindingContext = viewModel;
};

