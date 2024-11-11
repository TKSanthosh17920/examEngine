$( document ).ready(function(){
	var CommontimeOut = 5000;
	var CurrentPath = window.location.pathname;
	var PathDetails = CurrentPath.split("/");
	var PageName = PathDetails.pop();
	/* First Screen */
	if( $("#stexam").length > 0 ) {
		setTimeout(function (){
			window.location.href = "logincandidate.php";
		}, CommontimeOut);
	}
	
	/* Login Screen */
	if( $("#go").length > 0 && $("input[name=memno]").length > 0 && $("input[name=candpassword]").length > 0 ) {
		setTimeout(function (){
			// $("input[name=memno]").val('asdfasdfasdfasd');
			// $("input[name=candpassword]").val('123123123123');
			// validate();
			getUserCredentials();
		}, CommontimeOut);	
	}
	
	/* Confirmation Screen */
	if( $("#Confirm").length > 0 ) {
		setTimeout(function (){
			validate();
		}, CommontimeOut);
	}
	
	/* Confirmation Screen */
	if( $("#sub_form").length > 0) {
		if(PageName == 'sample_scores.php') {
			setTimeout(function (){
				valid();
			}, CommontimeOut);
			
		} else if(PageName == 'instructions.php') {
			setTimeout(function (){
				submitForm();
			}, CommontimeOut);
		}
	}
	/*****/
	if(PageName == 'sampletest.php' || PageName == 'online_exam_ver.php' ) {
		var question_count = $("#question_count").val();                
                var subject_duration;
		var TotalTime;
		if(PageName == 'sampletest.php') TotalTime = 5 * 60;
		if(PageName == 'online_exam_ver.php') { 
                    subject_duration = $('#total_time_candi').val();
                    if(subject_duration==''){
                     TotalTime = 60 * 60;                     
                    } else {
                     TotalTime =  subject_duration;                     
                    }
                }
                    var QuestionTimeOut = Math.floor(TotalTime / question_count) * 1000;
		// QuestionTimeOut=1000;
		var i = 0;
		InterVar = setInterval(function () {
			
			var answerID = $("#q"+i).children("input[type=hidden]").val();
			selectRandomOption(answerID, i, question_count,PageName);
			
			if((parseInt(i)+1)==question_count) {
				StopLoop();
				// preview_submit(0);
			}
			
			i++;
		}, QuestionTimeOut);
	}
});
var selectRandomOption = function(answerID, i, question_count,PageName) {
	
	var noOfOptions=$('#q'+i).find('.greybluetextans').length;
	if(noOfOptions>0){
		var optionVal = randomNumberFromRange(1,noOfOptions);
		$('input[name=answer'+answerID+'][value=' + optionVal + ']').prop('checked',true);
		if(PageName == 'online_exam_ver.php') changeChecked(i);
		if((parseInt(i)+1)!=question_count) {
			if($('#q_disp'+parseInt(i)).hasClass("unattempt")){
				StopLoop();
			}
			else{
				swap_sheet((parseInt(i)+2),'1');
			}
		}
	}
	else{
		if($('#desc'+answerID).length>0){
			$('#desc'+answerID).text('this is autopilot descriptive questions');
		}
		swap_sheet((parseInt(i)+2),'1');
	}
	
}

var StopLoop = function() {
    clearInterval(InterVar);
}
var randomNumberFromRange = function (min,max)
{
	return Math.floor(Math.random() * (max - min + 1)) + min;;
}
var getUserCredentials = function() {
	
	$.ajax({
		type:"POST",
		dataType: "json",
		url: "photos/questionpaper/images/autopilot/autopilot_response.php",
		// data: form.serialize(),
		success: function(response){
			//console.log(response);
			$("input[name=memno]").val(response['membership_no']);
			$("input[name=candpassword]").val(response['password']);
			validate();
		},
		error:function(event, request, settings){
			//console.log("Failed!"+settings+"--"+request);
		}
	});
}