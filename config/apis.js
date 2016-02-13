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
	client_global : {
		client_id : 'sjww-xyweb-node',
		secret : 'sjww2016-xyweb-node',
		redirect_uri : 'test',
		grant_type : 'password'
    },
    access_token_url: AUTH_API_BASIC_URL+'/pwd/oauth2/access_token',
    teacher_info_url: XY_API_BASIC_URL+'/api/pri/teacher/info',

    live_plan_options : {
        hostname : XY_API_HOST,
        port : XY_API_PORT,
        path : '/api/pri/live/plan',
        method : 'POST'
    },
    course_info_options : {
        hostname : XY_API_HOST,
        port : XY_API_PORT,
        path : '/api/pri/course/courseInfo',
        method : 'POST'
    },
    school_info_options : {
        hostname : XY_API_HOST,
        port : XY_API_PORT,
        path : '/api/pri/school/info',
        method : 'POST'
    },
    teacher_list_options : {
        hostname : XY_API_HOST,
        port : XY_API_PORT,
        path : '/api/pri/teacher/list',
        method : 'POST'
    },
    class_list_options : {
        hostname : XY_API_HOST,
        port : XY_API_PORT,
        path : '/api/pri/class/list',
        method : 'POST'
    },
    student_list_options : {
        hostname : XY_API_HOST,
        port : XY_API_PORT,
        path : '/api/pri/student/list',
        method : 'POST'
    },
    message_unread_count_options : {
        hostname : XY_API_HOST,
        port : XY_API_PORT,
        path : '/api/pri/announce/getCountNoRead',
        method : 'POST'
    },
    message_list_options : {
        hostname : XY_API_HOST,
        port : XY_API_PORT,
        path : '/api/pri/announce/list',
        method : 'POST'
    },
    message_detail_options : {
        hostname : XY_API_HOST,
        port : XY_API_PORT,
        path : '/api/pri/announce/detail',
        method : 'POST'
    },
    score_list_options : {
        hostname : XY_API_HOST,
        port : XY_API_PORT,
        path : '/api/pri/score/searchAllBatchScore',
        method : 'POST'
    },
    
    video_list_options : {
        hostname : RES_API_HOST,
        port : RES_API_PORT,
        path : '/api/pri/livealbum/livePackageListByIds',
        method : 'POST'
    },
    doc_list_latest_options : {
        hostname : RES_API_HOST,
        port : RES_API_PORT,
        path : '/api/pri/livealbum/liveResource',
        method : 'POST'
    },
    course_pkg_detail_options : {
        hostname : RES_API_HOST,
        port : RES_API_PORT,
        path : '/api/pri/pkg/pkglist',
        method : 'POST'
    },
    course_pkg_week_resource_options : {
        hostname : RES_API_HOST,
        port : RES_API_PORT,
        path : '/api/pri/livealbum/liveResourceByWeek',
        method : 'POST'
    }
};