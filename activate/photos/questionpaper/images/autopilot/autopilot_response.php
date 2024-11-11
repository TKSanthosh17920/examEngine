<?php
require_once("../../../../dbconfig.php");
masterConnect();
slaveConnect();
require_once("../../../../session_handle.php");

header('Content-Type: application/json');

if (isset($_REQUEST['m_no']) && !empty($_REQUEST['m_no'])) {
    if (isset($_SESSION)) {
        $data = array('succes' => '1', 'membership_no' => $_SESSION['memno'], 'subject_duration' => $_SESSION['subject_duration']);
    } else {
        $data = array('succes' => '0');
    }
} else {

    $actQry = "Select SUBSTRING_INDEX(download_sec,'-',-1) as exTime from qp_download where download_sec like '%Activated%' order by id desc limit 1";
    $actRes = mysql_query($actQry);
    $actCnt = mysql_num_rows($actRes);
    if ($actCnt > 0) {
        list($exTime) = mysql_fetch_array($actRes);

        //GET SYSTEM IP
		/*print_r($_SERVER);
        echo $system_ip_det = shell_exec('ipconfig /all | findstr "IPv4"');
        $removalwords = array("IPv4 Address. . . . . . . . . . . : ", "(Preferred)");
        $replacewords = array(" ", " ");
        $system_ip_det = str_replace($removalwords, $replacewords, $system_ip_det);

		*/
		$system_ip_det = $_SERVER['REMOTE_ADDR'];
        //GETTING THE BIOMETRIC REGISTER USER
        $qry = "select a.membership_no from iib_candidate_iway a, iib_candidate b, candidate_seat_management c,biometric_report_api d
                 where b.password!='' and a.membership_no NOT IN( select distinct(membership_no) from iib_candidate_tracking ) and exam_time='" . $exTime . "' 
                and c.candidate_ipaddress='" . trim($system_ip_det) . "'  and d.labname=c.exam_lab_code and  d.seat_no=c.exam_seatno and d.membership_no=a.membership_no and d.membership_no=b.membership_no";

        $res = mysql_query($qry);

        $counTrackMemList = mysql_num_rows($res);

        //GREATER THAN ONE PICK ONLY ONE USER 
        if ($counTrackMemList > 1) {            
            while ($rowData = mysql_fetch_object($res)) {
                $MEMBERSHIPNO[] = $rowData->membership_no;
            }
            $membership_no = shuffle_assoc($MEMBERSHIPNO);
        } else {
            //IF IS EQUAL TO 1
            if ($counTrackMemList == 1) {
                list($membership_no) = mysql_fetch_array($res);
            } else {
                //BIOMETRIC REGISTER FAILED - 0 - PICK NON BIOMETRIC REGISTER USER 
                $qry = "select a.membership_no from iib_candidate_iway a, iib_candidate b
                where b.password!='' and a.membership_no NOT IN( select distinct(membership_no) from iib_candidate_tracking UNION Select x.membership_no from candidate_seat_management y,biometric_report_api x where x.seat_no=y.exam_seatno ) and exam_time='" . $exTime . "' 
                and a.membership_no=b.membership_no";

                $res = mysql_query($qry);

                $counTrackMemList = mysql_num_rows($res);
                //GREATER THAN ONE PICK ONLY ONE USER
                if ($counTrackMemList > 0) {
                    while ($rowData = mysql_fetch_object($res)) {
                        $MEMBERSHIPNO[] = $rowData->membership_no;
                    }
                    $membership_no = shuffle_assoc($MEMBERSHIPNO);
                    insertSkipValid($membership_no,$exTime);
                }
            }
        }
       
        if ($membership_no != '') {
            $data = array('succes' => '1', 'membership_no' => $membership_no, 'password' => "password", 'sample_test_duration' => 600, 'subject_duration' => 3600);
        } else {
            $data = array('succes' => '0');
        }
    } else {
        $data = array('succes' => '0');
    }
}

echo json_encode($data);

function shuffle_assoc($list) {
    if (!is_array($list))
        return $list;

    $keys = array_keys($list);
    shuffle($keys);
    $random = array();
    foreach ($keys as $key)
        $random = $list[$key];

    return $random;
}

function insertSkipValid($memno, $time) {
    $sql = "select skip_id,exam_slot_time,exam_date from exam_skip_biometricvalidation Where membership_no='" . $memno . "'";
    if ($time != '') {
        $sql .= " And exam_slot_time= '" . $time . "'";
    }
    
    $sdata = mysql_query($sql);
    $affectedrows = mysql_num_rows($sdata);
    if ($affectedrows > 0) {
        $bioMetSkipId = "membership_no='" . $memno . "'";
        $query = "update exam_skip_biometricvalidation set skip_status=1,date_updated=NOW() Where " . $bioMetSkipId;
    } else {
        $query = "insert into exam_skip_biometricvalidation(exam_date,exam_slot_time,skip_mode,dateaddedon,skip_status,membership_no) values('" . date('Y-m-d') . "','" . $time . "','1',NOW(),'1','" . $memno . "')";
    }
    
    $affectedrows = mysql_query($query) or die(mysql_error());
    return $affectedrows;
}

?>
