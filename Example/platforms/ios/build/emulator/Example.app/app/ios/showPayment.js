var frameModule = require("ui/frame");
var eghlpay = new EGHLPayment();
var dialogs = require("ui/dialogs");

var eghlViewModel = require("./eghl-view-model").eghlViewModel;

exports.loaded = function(args) {
    var page = args.object;
    page.bindingContext = eghlViewModel();

    // page.bindingContext.iosSale(args)

    // Add eghl to view
    var stackLayout = page.getViewById("paymentView");
    eghlpay.frame = {origin: {x:0, y:0}, size: {width: stackLayout.ios.superview.frame.size.width, height:stackLayout.ios.superview.frame.size.height}};

    stackLayout.ios.addSubview(eghlpay);

    //preparing payment details
    var payparam = PaymentRequestPARAM.new();

	payparam.realHost = false;
    payparam.ServiceID = "SIT";
    payparam.Password = "sit12345";
    payparam.LanguageCode = "EN";
    payparam.MerchantName = "eGHL Payment Testing";
    payparam.MerchantReturnURL = "SDK";
	// payparam.MerchantCallBackURL = "http://callback.com"

    payparam.TransactionType = "SALE";
    payparam.PymtMethod = "ANY";


    payparam.CustEmail = "arif.jusoh@ghl.com";
    payparam.CustName = "Arif";
    payparam.CustPhone = "0123456789";
    payparam.PaymentDesc = "Purchasing goods";

    payparam.Amount = "1.00";
    payparam.CurrencyCode = "MYR";

    payparam.PaymentID = 'SDK'+ new Date().getTime();
    payparam.OrderNumber = payparam.PaymentID;

	// Submit Payment details;
	// eghlpay.paymentAPISuccessBlockFailedBlock(payparam, successBlock, failedBlock);
};

function successBlock (ParamData) {
	var keys = [ "Amount", "AuthCode", "BankRefNo", "CardExp", "CardHolder", "CardNoMask", "CardType", "CurrencyCode", "EPPMonth", "EPP_YN", "HashValue", "HashValue2", "IssuingBank", "OrderNumber", "PromoCode", "PromoOriAmt", "Param6", "Param7", "PaymentID", "PymtMethod", "QueryDesc", "ServiceID", "SessionID", "SettleTAID", "TID", "TotalRefundAmount", "Token", "TokenType", "TransactionType", "TxnExists", "TxnID", "TxnMessage", "TxnStatus", "ReqToken", "PairingToken", "PreCheckoutId", "Cards", "mpLightboxError"
	];

	var dispMessage = "";
	for (var key_index in keys) {
		var key = keys[key_index];
		var value = ParamData.valueForKey(key);

		if (value && value != null) {
			console.log(key+":"+value);
			dispMessage += key+":"+value+"\n";
		}
	}

	dialogs.alert({
		message: dispMessage,
		okButtonText: "Ok",
	}).then(function () {
			toMainPage();
	});
}

function failedBlock (errorCode, errorData, error){
	console.log("errorCode:" + errorCode + "; errorData:" + errorData);
	dialogs.alert({
		message: "errorCode:" + errorCode + "; errorData:" + errorData,
		okButtonText: "Ok",
	}).then(function () {
		toMainPage();
	});
}

function toMainPage() {
	var topmost = frameModule.topmost();
	topmost.navigate({
		moduleName:"main-page",
		clearHistory: true,
		transition: {
			name: "slideRight",
        }
    });
}

exports.onCancelBtnTap = function (args){
	dialogs.confirm({
		title: "Are you sure you want to quit",
		message: "Pressing BACK button will close and abandon the payment session.",
		okButtonText: "Exit",
		cancelButtonText: "Cancel"
	}).then(function (result) {
		if (result) {
			eghlpay.finalizeTransaction()
		}
	});
};