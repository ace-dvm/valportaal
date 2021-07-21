
function Login(){
	var id =  document.getElementById('username').value;
	//Simple check if form was filled.
	if (!id){
		console.log("No patient number");
		return false;
	}
	loadAdviceSnippet(id);
};

function loadAdviceSnippet(id){
	//static json for local test
	//fetch(`patient-advice.json`).then(async res => {
	fetch(`../advice?id=${id}`).then(async res => {
		let patient_json = await res.json();
		let med_advice = "Geen";
		let nonmed_advice = "Geen";
		//Does the json have finalized advice?
		if(patient_json["patient_advice"] != undefined && Object.keys(patient_json["patient_advice"]).length > 0){
			// Display with-data advice page
			fetch('advies-logged-in-with-data.html')
				.then(function(response) {
					return response.text();
				})
				.then(function(body) {
					//Get template snippet:
					document.getElementById("content").innerHTML = body;
					//Fill out rest:
					med_advice = createMedAdviceHTML(patient_json["patient_advice"][0]["json_advice"]);
					document.getElementById("med_advice").innerHTML = med_advice;
					nonmed_advice = createNonmedAdviceHTML(patient_json["patient_advice"][0]["json_advice"]);
					document.getElementById("nonmed_advice").innerHTML = nonmed_advice;
				});
		} else {
			// Display no-data advice page
			fetch('advies-logged-in-no-data.html')
				.then(function(response) {
					return response.text();
				})
				.then(function(body) {
					document.getElementById("content").innerHTML = body;
				});

		}
	}).catch(err => {
		// this triggers on broken JSON or failed fetch
		console.log(err)
	});
};

//TODO this function is tested in the testcafe test, but should probably have a unit test too. advice.test.js doesn't exist yet.
function createMedAdviceHTML(json_advice) {
	let med_advice = "";
	let current_med_name = "";
	for (let i = 0; i < json_advice.length; ++i ) {
		if(json_advice[i]["ATC_code"].match(/[A-Z][0-9].+/)){
			let advice_text = formatAdvice(json_advice[i]["advice"], json_advice[i]["freetext"]);
			advice_text = "<div  class=\"med_advice_text\"><ul>" +  advice_text + "</ul></div>";
			advice_text = advice_text.replace("<p>", "<li>");
			advice_text = advice_text.replace("</p>", "</li>");
			let med_name = json_advice[i]["medcat_name"];
			med_name = med_name.charAt(0).toUpperCase() + med_name.slice(1);
			let med_name_div = "";
			if(med_name !== current_med_name){
				current_med_name = med_name;
				med_name_div = "<div id=\"div_med_name_" + json_advice[i]["ATC_code"]
					+"\" class = \"med_name\">"
					+med_name
					+"</div>\n";
			}
			med_advice += med_name_div + advice_text;
		}
	}
	if (med_advice == "") {
		med_advice = "Geen"
	}
	return med_advice;
}

function createNonmedAdviceHTML(json_advice) {
	let nonmed_advice = "";
	let current_category_name = "";	
	for (let i = 0; i < json_advice.length; ++i ) {
		if(json_advice[i]["ATC_code"].match(/NONMED/)){
			let advice_text = formatAdvice(json_advice[i]["advice"], json_advice[i]["freetext"]);
			advice_text = "<div  class=\"nonmed_advice_text\">" +  advice_text + "</div>";
			let category_name = json_advice[i]["medcat_name"];
			let category_name_div = "";
			if(category_name !== current_category_name){
				current_category_name = category_name;
				category_name_div = "<div id=\"div_category_name_" + category_name.substr(0,3).replace("ë", "e")
					+"\" class = \"category_name\">"
					+category_name
					+"</div>\n";
			}
			nonmed_advice += category_name_div + advice_text;
		}
	}
	if (nonmed_advice == "") {
		nonmed_advice = "Geen"
	}
	return nonmed_advice;
}

let md = new showdown.Converter();
function formatAdvice(advice_text, freetext){
	if(freetext == null){
		freetext = "";
	}
	let formatted_advice = md.makeHtml(advice_text);
	let regex = /(\{\{free text.*\}\})/;
	formatted_advice = formatted_advice.replace(regex, freetext);
	return formatted_advice;
}
