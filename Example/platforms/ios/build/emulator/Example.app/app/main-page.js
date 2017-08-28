/*
In NativeScript, a file with the same name as an XML file is known as
a code-behind file. The code-behind is a great place to place your view
logic, and to set up your page’s data binding.
*/

/*
NativeScript adheres to the CommonJS specification for dealing with
JavaScript modules. The CommonJS require() function is how you import
JavaScript modules defined in other files.
*/ 


var eghlViewModel = require("./eghl-view-model").eghlViewModel;

function onNavigatingTo(args) {
    /*
    This gets a reference this page’s <Page> UI component. You can
    view the API reference of the Page to see what’s available at
    https://docs.nativescript.org/api-reference/classes/_ui_page_.page.html
    */
    var page = args.object;
    /*
    A page’s bindingContext is an object that should be used to perform
    data binding between XML markup and JavaScript code. Properties
    on the bindingContext can be accessed using the {{ }} syntax in XML.
    In this example, the {{ message }} and {{ onTap }} bindings are resolved
    against the object returned by createViewModel().

    You can learn more about data binding in NativeScript at
    https://docs.nativescript.org/core-concepts/data-binding.
    */
    page.bindingContext = eghlViewModel();
}

/*
Exporting a function in a NativeScript code-behind file makes it accessible
to the file’s corresponding XML file. In this case, exporting the onNavigatingTo
function here makes the navigatingTo="onNavigatingTo" binding in this page’s XML
file work.
*/
exports.onNavigatingTo = onNavigatingTo;



var frameModule = require("ui/frame");


exports.onSaleButtonPressed = function (args) {
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
        console.log("errr");
    }
};

exports.onQueryButtonPressed = function (args) {
    if (args.object.ios) {
        try{
             var payparam = PaymentRequestPARAM.new();

             payparam.TransactionType = "QUERY";
             payparam.PymtMethod = "ANY";
             payparam.PaymentID = 'AJ_MY_01503086298730';
             payparam.Amount = "1.00";
             payparam.CurrencyCode = "MYR";
             payparam.ServiceID = "SIT";
             payparam.Password = "sit12345";
             payparam.realHost = false;

             var eghlpay = new EGHLPayment();

           /* To list available function 
            var propValue;
            for(var propName in eghlpay) {
                propValue = eghlpay[propName]

                console.log(propName +"|"+propValue);
            }
            */
            var successBlock = function (ParamData) {
                var keys = [ "Amount", "AuthCode", "BankRefNo", "CardExp", "CardHolder", "CardNoMask", "CardType", "CurrencyCode", "EPPMonth", "EPP_YN", "HashValue", "HashValue2", "IssuingBank", "OrderNumber", "PromoCode", "PromoOriAmt", "Param6", "Param7", "PaymentID", "PymtMethod", "QueryDesc", "ServiceID", "SessionID", "SettleTAID", "TID", "TotalRefundAmount", "Token", "TokenType", "TransactionType", "TxnExists", "TxnID", "TxnMessage", "TxnStatus", "ReqToken", "PairingToken", "PreCheckoutId", "Cards", "mpLightboxError"
                ];

                for (var key_index in keys) {
                    var key = keys[key_index];
                    var value = ParamData.valueForKey(key);

                    if (value && value != null) {
                        console.log(key+":"+value);
                    }
                }
            };

            var failedBlock = function (errorCode, errorData, error){
                console.log("errorCode:" + errorCode + "; errorData:" + errorData);
            };

            eghlpay.paymentAPISuccessBlockFailedBlock(payparam, successBlock, failedBlock);
        } catch (e) {
            console.log (e);
        }
    } else if (args.object.android) {
        dialogs.alert({
            message: "Its an android",
            okButtonText: "Ok",
        });
    }
};