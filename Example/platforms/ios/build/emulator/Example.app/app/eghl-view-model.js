var Observable = require("data/observable").Observable;

var dialogs = require("ui/dialogs");

function setupPaymentConfiguration(viewModel){
	viewModel.realHost = false;
	viewModel.serviceID = "SIT";
	viewModel.password = "sit12345";

	viewModel.merchantName = "eGHL SIT Payment";
	viewModel.languageCode = "EN"; // MS

	viewModel.returnURL = "SDK";// Just put any dummy string, cannot be empty
	// viewModel.callbackURLL = @"https://abc.com/callback
}

function eGHLAmountFormat(x) {
    var parts = x.toString().split(".");
    if (parts.length<2){
    	return parts[0] + ".00";
    } else {
    	return parts.join(".");
    }
}

/**
 * Android
 */

function androidSale (args,viewModel) {
	var app = require("application");
	
	var EGHL = com.eghl.sdk.EGHL;
	var PaymentParams = com.eghl.sdk.params.PaymentParams;

	var eghlpay = EGHL.getInstance();


    var paymentID = eghlpay.generateId("SIT");
    var payment = new PaymentParams();

    var parameters = new PaymentParams.Builder();

	parameters.setTransactionType("SALE");
	parameters.setPaymentMethod("ANY"); // CC, DD
    parameters.setPageTimeout("500");
    parameters.setPaymentDesc("eGHL Payment testing");

	parameters.setPaymentGateway(viewModel.realHost?"https://securepay.e-ghl.com/ipg/payment.aspx":"https://test2pay.ghl.com/IPGSG/Payment.aspx");
	parameters.setServiceId(viewModel.serviceID);
	parameters.setPassword(viewModel.password);
	parameters.setMerchantName(viewModel.merchantName);
	parameters.setLanguageCode(viewModel.languageCode);
	parameters.setMerchantReturnUrl(viewModel.returnURL);
	// parameters.setMerchantCallBackURL(viewModel.callbackURLL;

	parameters.setCustName(global.user.fullname);
	parameters.setCustEmail(global.user.email);
	parameters.setCustPhone(global.user.phone);

	parameters.setAmount(eGHLAmountFormat(global.carts.totalAmounts));
	parameters.setCurrencyCode(global.carts.currency);
	parameters.setPaymentId(global.carts.referenceNo); // must be unique
	parameters.setOrderNumber(global.carts.referenceNo); // can be duplicate

    var paymentParams = parameters.build();
    console.log("PaymentParams"+paymentParams);

    var activity = app.android.foregroundActivity || app.android.startActivity;

    // console.log("Exception========================================");
    //ExecutePayment
    eghlpay.executePayment(paymentParams,activity);

    //onActivityResult
    app.android.on("activityResult", function (args) {
        var requestCode = args.requestCode;
        var resultCode = args.resultCode;
        var data = args.intent;
        console.log(data);

        var propValue;
        for(var propName in args) {
            propValue = args[propName]

            console.log(propName +"|"+propValue);
        }
        
        if (requestCode == EGHL.REQUEST_PAYMENT) {
            switch (resultCode) {
                case EGHL.TRANSACTION_SUCCESS:
                console.log("onActivityResult: payment successful");
                console.log("status" + data.getStringExtra(EGHL.TXN_MESSAGE));
                console.log("message" + data.getStringExtra(EGHL.TXN_MESSAGE));
                console.log("raw" + data.getStringExtra(EGHL.RAW_RESPONSE));
                break;
                case EGHL.TRANSACTION_FAILED:
                console.log("onActivityResult: payment failure");
                break;
                default:
                console.log("onActivityResult: " + resultCode);
                break;
            }
        } 
    });		
}


/**
 * iOS
 */
var frameModule = require("ui/frame");

function iosSale (args,viewModel) {
	
}

function eghlViewModel(){
	var viewModel = new Observable();

	setupPaymentConfiguration(viewModel);
	viewModel.loaded = function(args) {
		console.log("OK this work");
	}
	
	viewModel.onSaleButtonPressed = function(args) {
		if (args.object.ios) {
			var topmost = frameModule.topmost();
			topmost.navigate({
				moduleName:"ios/showPayment",
				clearHistory: true,
				transition: {
					name: "slideLeft",
				}
			});
		} else if (args.object.android) {
			androidSale(args,this);
		}
	};

	return viewModel;
}

exports.eghlViewModel = eghlViewModel;