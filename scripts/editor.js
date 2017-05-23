define([],function(){
	requireElement(document.getElementById("editor").innerHTML,function(div, row){
		document.body.appendChild(div);
		for(var i=0;i<9;i++){
			row(function(cell){
				for(j=0;j<9;j++){
					cell();
				}
			});
		}
	});
})