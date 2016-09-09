sap.ui.controller("sap.ui.demo.myFiori.view.Master", {

    /*
	handleListItemPress : function (evt) {
		var context = evt.getSource().getBindingContext();
		this.nav.to("Detail", context);
	},
    */

    onBeforeRendering : function(){
        var aData = [
	{lastName: "Dente", name: "Al", checked: true, linkText: "www.sap.com", href: "http://www.sap.com", src: "images/person1.gif", gender: "male", rating: 4},
	{lastName: "Friese", name: "Andy", checked: true, linkText: "www.sap.com", href: "http://www.sap.com", src: "images/person2.gif", gender: "male", rating: 2},
	{lastName: "Mann", name: "Anita", checked: false, linkText: "www.sap.com", href: "http://www.sap.com", src: "images/person1.gif", gender: "female", rating: 3},
	{lastName: "Schutt", name: "Doris", checked: true, linkText: "www.sap.com", href: "http://www.sap.com", src: "images/person1.gif", gender: "female", rating: 4},
	{lastName: "Open", name: "Doris", checked: true, linkText: "www.sap.com", href: "http://www.sap.com", src: "images/person1.gif", gender: "female", rating: 2},
	{lastName: "Dewit", name: "Kenya", checked: false, linkText: "www.sap.com", href: "http://www.sap.com", src: "images/person1.gif", gender: "female", rating: 3},
	{lastName: "Zar", name: "Lou", checked: true, linkText: "www.sap.com", href: "http://www.sap.com", src: "images/person1.gif", gender: "male", rating: 1},
	{lastName: "Burr", name: "Tim", checked: true, linkText: "www.sap.com", href: "http://www.sap.com", src: "images/person2.gif", gender: "male", rating: 2},
	{lastName: "Hughes", name: "Tish", checked: true, linkText: "www.sap.com", href: "http://www.sap.com", src: "images/person1.gif", gender: "male", rating: 5},
	{lastName: "Town", name: "Mo", checked: true, linkText: "www.sap.com", href: "http://www.sap.com", src: "images/person1.gif", gender: "male", rating: 3},
	{lastName: "Case", name: "Justin", checked: false, linkText: "www.sap.com", href: "http://www.sap.com", src: "images/person1.gif", gender: "male", rating: 3},
	{lastName: "Time", name: "Justin", checked: true, linkText: "www.sap.com", href: "http://www.sap.com", src: "images/person1.gif", gender: "male", rating: 4},
	{lastName: "Barr", name: "Sandy", checked: true, linkText: "www.sap.com", href: "http://www.sap.com", src: "images/person1.gif", gender: "male", rating: 2},
	{lastName: "Poole", name: "Gene", checked: true, linkText: "www.sap.com", href: "http://www.sap.com", src: "images/person2.gif", gender: "male", rating: 1},
	{lastName: "Ander", name: "Corey", checked: false, linkText: "www.sap.com", href: "http://www.sap.com", src: "images/person1.gif", gender: "male", rating: 5},
	{lastName: "Early", name: "Brighton", checked: true, linkText: "www.sap.com", href: "http://www.sap.com", src: "images/person1.gif", gender: "male", rating: 3},
	{lastName: "Noring", name: "Constance", checked: true, linkText: "www.sap.com", href: "http://www.sap.com", src: "images/person1.gif", gender: "female", rating: 4},
	{lastName: "O'Lantern", name: "Jack", checked: true, linkText: "www.sap.com", href: "http://www.sap.com", src: "images/person1.gif", gender: "male", rating: 2},
	{lastName: "Tress", name: "Matt", checked: true, linkText: "www.sap.com", href: "http://www.sap.com", src: "images/person2.gif", gender: "male", rating: 4},
	{lastName: "Turner", name: "Paige", checked: true, linkText: "www.sap.com", href: "http://www.sap.com", src: "images/person1.gif", gender: "female", rating: 3}
        ];

        this.getView().setModel(new sap.ui.model.json.JSONModel(), "modelData");
        this.getView().setModel(new sap.ui.model.json.JSONModel(), "oState");
        this.getView().getModel("modelData").setProperty("/test",aData);


        this.getView().getModel("oState").loadData('../../../../../ZEBASE/build/nrg/base/component/json/States.json',{},false,'GET',false,false,{});
        this.getView().getModel("oState").setProperty("/selKey" , "TX");
    },

    onButtonClick : function(evt) {
        var oDialogFragment = sap.ui.xmlfragment("sap.ui.demo.myFiori.view.MasterFragment",this);
        oDialogFragment.open();
    },

    testFunc:function(evt){
        alert("clicked") ;
    },

    testInputChange: function(evt){
        alert("yes changed") ;
    },

    whyThisWork: function(evt){
        alert("why why why") ;
    },

    testCheckBox: function(evt){
        alert("Checkbox Checked or Unchecked") ;
    },
    onGoToTestPage: function(evt){
        this.nav.to("Detail");
    }
});
