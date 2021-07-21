function Login() {

	var patient_id =  document.getElementById('username').value;
	var password =    document.getElementById('password').value;
	if (!patient_id){
		return false;
	}

	// fancy login stuff happens here
	// 
	// if response is ok (login worked); 
	// then get data from out backend;
	//      if no-data:
	fetch('advies-logged-in-no-data.html')
		.then(function(response) {
			return response.text();
		})
		.then(function(body) {
			document.getElementById("content").innerHTML = body;
		});
	//      else 
	//      Show personalized advice page
}
