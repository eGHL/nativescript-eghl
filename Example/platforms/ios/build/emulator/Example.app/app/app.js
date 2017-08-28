/*
In NativeScript, the app.js file is the entry point to your application.
You can use this file to perform app-level initialization, but the primary
purpose of the file is to pass control to the app’s first module.
*/

require("./bundle-config");
var application = require("application");

global.carts = {
	totalAmounts:10,
	currency:"MYR",
	referenceNo:'SDK'+ new Date().getTime(), // must be unique for eGHL payment id usage
	items:[
		{
			price:3.5,
			itemCode:"Item001",
			description:"Nice thing to have",
		},
		{
			price:6.5,
			itemCode:"Item002",
			description:"Nice thing to have",
		}
	]
};

global.user = {
	username:"ruby.von.rails",
	fullname:"Ruby Von Rails",
	email:"ruby.von.rails@email.com",
	phone:"+60 12 345 6789",
}


application.start({ moduleName: "main-page" });

/*
Do not place any code after the application has been started as it will not
be executed on iOS.
*/
