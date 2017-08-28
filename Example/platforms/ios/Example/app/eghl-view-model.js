var Observable = require("data/observable").Observable;

var dialogs = require("ui/dialogs");

function eghlViewModel(args){
	var viewModel = new Observable();

	setupPaymentConfiguration(viewModel);

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
			android_sale(args,this);
		}
	};

	if (args && args.object.ios) {
		viewModel.eghlpay = new EGHLPayment();
	}

	viewModel.onCancelBtnTap = function (args){
		var __eghlpay = this.eghlpay;
		dialogs.confirm({
			title: "Are you sure you want to quit",
			message: "Pressing BACK button will close and abandon the payment session.",
			okButtonText: "Exit",
			cancelButtonText: "Cancel"
		}).then(function (result) {
			if (result) {
				__eghlpay.finalizeTransaction();
			}
		});
	};

	if (args && args.object.ios) {
		ios_sale(args, viewModel);
		
	}
	return viewModel;
}

exports.eghlViewModel = eghlViewModel;

function transactionResult(resultData) {
	console.log(resultData);
	var keys = [ "Amount", "AuthCode", "BankRefNo", "CardExp", "CardHolder", "CardNoMask", "CardType", "CurrencyCode", "EPPMonth", "EPP_YN", "HashValue", "HashValue2", "IssuingBank", "OrderNumber", "PromoCode", "PromoOriAmt", "Param6", "Param7", "PaymentID", "PymtMethod", "QueryDesc", "ServiceID", "SessionID", "SettleTAID", "TID", "TotalRefundAmount", "Token", "TokenType", "TransactionType", "TxnExists", "TxnID", "TxnMessage", "TxnStatus", "ReqToken", "PairingToken", "PreCheckoutId", "Cards", "mpLightboxError"];

	console.log(contentsAsStrings(keys, resultData));
	dialogs.alert({
		message: contentsAsStrings(keys, resultData),
		okButtonText: "Ok",
	})
}


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

function contentsAsStrings(keys, obj){
	var dispMessage = "";
	for (var key_index in keys) {
		var key = keys[key_index];
		var value = obj[key];

		if (value && value != null) {
			dispMessage += key+":"+value+"\n";
		}
	}

	return dispMessage;
}


/**
 * Android
 */
function android_sale (args,viewModel) {
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
	// parameters.setMerchantCallbackUrl(viewModel.callbackURLL;

	parameters.setCustName(global.user.fullname);
	parameters.setCustEmail(global.user.email);
	parameters.setCustPhone(global.user.phone);

	parameters.setAmount(eGHLAmountFormat(global.carts.totalAmounts));
	parameters.setCurrencyCode(global.carts.currency);
	parameters.setPaymentId(global.carts.referenceNo); // must be unique
	parameters.setOrderNumber(global.carts.referenceNo); // can be duplicate

    var paymentParams = parameters.build();
    // console.log("PaymentParams"+paymentParams);

    var activity = app.android.foregroundActivity || app.android.startActivity;

    // console.log("Exception========================================");
    //ExecutePayment
    eghlpay.executePayment(paymentParams,activity);

    //onActivityResult
    app.android.on("activityResult", function (args) {
        var requestCode = args.requestCode;
        var resultCode = args.resultCode;
        var data = args.intent;
        
        if (requestCode == EGHL.REQUEST_PAYMENT) {
        	transactionResult(JSON.parse(data.getStringExtra(EGHL.RAW_RESPONSE)));
            // switch (resultCode) {
            //     case EGHL.TRANSACTION_SUCCESS:
            //     console.log("onActivityResult: payment successful");
            //     console.log("status" + data.getStringExtra(EGHL.TXN_MESSAGE));
            //     console.log("message" + data.getStringExtra(EGHL.TXN_MESSAGE));
            //     console.log("raw" + data.getStringExtra(EGHL.RAW_RESPONSE));

            //     break;
            //     case EGHL.TRANSACTION_FAILED:
            //     console.log("onActivityResult: payment failure");
            //     console.log("raw" + data.getStringExtra(EGHL.RAW_RESPONSE));

            //     break;
            //     default:
            //     console.log("onActivityResult: " + resultCode);
            //     break;
            // }
        } 
    });		
}


/**
 * iOS
 */
var frameModule = require("ui/frame");

function ios_sale (args,viewModel) {
	var page = args.object;

	// Add eghl to view
    var stackLayout = page.getViewById("paymentView");
    viewModel.eghlpay.frame = {origin: {x:0, y:0}, size: {width: stackLayout.ios.superview.frame.size.width, height:stackLayout.ios.superview.frame.size.height}};

    stackLayout.ios.addSubview(viewModel.eghlpay);

    //preparing payment details
    var parameters = PaymentRequestPARAM.new();

	parameters.TransactionType = "SALE" ;
	parameters.PymtMethod = "ANY" ; // CC, DD
    parameters.PageTimeout = "500" ;
    parameters.PaymentDesc = "eGHL Payment testing" ;

	parameters.realHost = viewModel.realHost;
	parameters.ServiceID = viewModel.serviceID ;
	parameters.Password = viewModel.password ;
	parameters.MerchantName = viewModel.merchantName ;
	parameters.LanguageCode = viewModel.languageCode ;
	parameters.MerchantReturnURL = viewModel.returnURL ;
	// parameters.MerchantCallBackURL = viewModel.callbackURLL;

	parameters.CustName = global.user.fullname ;
	parameters.CustEmail = global.user.email ;
	parameters.CustPhone = global.user.phone ;

	parameters.Amount = eGHLAmountFormat(global.carts.totalAmounts) ;
	parameters.CurrencyCode = global.carts.currency ;
	parameters.PaymentID = global.carts.referenceNo ; // must be unique
	parameters.OrderNumber = global.carts.referenceNo ; // can be duplicate

	// var keys = ["realHost","Amount", "PaymentID", "OrderNumber", "MerchantName", "ServiceID", "PymtMethod", "MerchantReturnURL", "CustEmail", "Password", "CustPhone", "CurrencyCode", "CustName", "LanguageCode", "PaymentDesc", "PageTimeout", "CustIP", "MerchantApprovalURL", "CustMAC", "MerchantUnApprovalURL", "CardHolder", "CardNo", "CardExp", "CardCVV2", "BillAddr", "BillPostal", "BillCity", "BillRegion", "BillCountry", "ShipAddr", "ShipPostal", "ShipCity", "ShipRegion", "ShipCountry", "TransactionType", "TokenType", "Token", "SessionID", "IssuingBank", "MerchantCallBackURL", "B4TaxAmt", "TaxAmt", "Param6", "Param7", "EPPMonth", "PromoCode", "ReqVerifier", "PairingVerifier", "CheckoutResourceURL", "ReqToken", "PairingToken", "CardId", "PreCheckoutId", "mpLightboxParameter",  "sdkTimeOut"];
	// console.log(contentsAsStrings(keys,parameters));

	// Submit Payment details;
	viewModel.eghlpay.paymentAPISuccessBlockFailedBlock(parameters, ios_successBlock, ios_failedBlock);
}

function ios_successBlock (responseData) {
	ios_toMainPage();
	transactionResult(responseData);

	// var keys = [ "Amount", "AuthCode", "BankRefNo", "CardExp", "CardHolder", "CardNoMask", "CardType", "CurrencyCode", "EPPMonth", "EPP_YN", "HashValue", "HashValue2", "IssuingBank", "OrderNumber", "PromoCode", "PromoOriAmt", "Param6", "Param7", "PaymentID", "PymtMethod", "QueryDesc", "ServiceID", "SessionID", "SettleTAID", "TID", "TotalRefundAmount", "Token", "TokenType", "TransactionType", "TxnExists", "TxnID", "TxnMessage", "TxnStatus", "ReqToken", "PairingToken", "PreCheckoutId", "Cards", "mpLightboxError"];
	// dialogs.alert({
	// 	message: contentsAsStrings(keys, responseData),
	// 	okButtonText: "Ok",
	// }).then(function () {
	// 	ios_toMainPage();
	// });
}

function ios_failedBlock (errorCode, errorData, error){
	console.log("errorCode:" + errorCode + "; errorData:" + errorData);
	dialogs.alert({
		message: "errorCode:" + errorCode + "; errorData:" + errorData,
		okButtonText: "Ok",
	}).then(function () {
		ios_toMainPage();
	});
}

function ios_toMainPage() {
	var topmost = frameModule.topmost();
	topmost.navigate({
		moduleName:"main-page",
		clearHistory: true,
		transition: {
			name: "slideRight",
        }
    });
}
//End ios