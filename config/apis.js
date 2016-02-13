'use strict';

var AUTH_API_HOST = '182.150.3.229';
var AUTH_API_PORT = 8080;

const AUTH_API_BASIC_URL='http://'+AUTH_API_HOST+':'+AUTH_API_PORT;

var XY_API_HOST = '182.150.3.229';
var XY_API_PORT = 3030;
const XY_API_BASIC_URL='http://'+XY_API_HOST+':'+XY_API_PORT;

var RES_API_HOST = '182.150.3.229';
var RES_API_PORT = 7070;
const RES_API_BASIC_URL='http://'+RES_API_HOST+':'+RES_API_PORT;

module.exports = {
    //app key
	client_global : {
		client_id : 'sjww-xyweb-node',
		secret : 'sjww2016-xyweb-node',
		redirect_uri : 'test',
		grant_type : 'password'
    },
    //TOKEN URL
    access_token_url: AUTH_API_BASIC_URL+'/pwd/oauth2/access_token',

    //XY API
    teacher_info_url: XY_API_BASIC_URL+'/api/pri/teacher/info',
    live_plan_url:XY_API_BASIC_URL+'/api/pri/live/plan',
    course_info_url : XY_API_BASIC_URL+'/api/pri/course/courseInfo',
    school_info_url : XY_API_BASIC_URL+'/api/pri/school/info',
    teacher_list_url: XY_API_BASIC_URL+'/api/pri/teacher/list',
    class_list_url : XY_API_BASIC_URL+'/api/pri/class/list',
    student_list_url : XY_API_BASIC_URL+'/api/pri/student/list',
    message_unread_count_url : XY_API_BASIC_URL+'/api/pri/announce/getCountNoRead',
    message_list_url : XY_API_BASIC_URL+ '/api/pri/announce/list',
    message_detail_url : XY_API_BASIC_URL+ '/api/pri/announce/detail',
    score_list_url : XY_API_BASIC_URL+'/api/pri/score/searchAllBatchScore',

    //RESOURCE API
    video_list_url : RES_API_BASIC_URL+ '/api/pri/livealbum/livePackageListByIds',
    doc_list_latest_url : RES_API_BASIC_URL+'/api/pri/livealbum/liveResource',
    course_pkg_detail_url : RES_API_BASIC_URL+'/api/pri/pkg/pkglist',
    course_pkg_week_resource_url : RES_API_BASIC_URL+'/api/pri/livealbum/liveResourceByWeek'



};