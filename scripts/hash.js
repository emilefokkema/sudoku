define([],function(){
	return {
		read:function(setValue){
			var string = window.location.hash;
			if(!string){return;}
			string = string.substr(1);
			var match = string.match(/^(\d{9})(\d{9})(\d{9})(\d{9})(\d{9})(\d{9})(\d{9})(\d{9})(\d{9})$/);
			if(!match){return;}
			for(var i=1;i<=9;i++){
				match[i].match(/\d/g).map(function(n,j){
					setValue(i - 1, j, parseInt(n) | null);
				});
			}
		},
		write:function(rows){
			window.location.hash = rows.map(function(r){return r.map(function(n){return n?""+n:"0";}).join("");}).join("")
		}
	};
})