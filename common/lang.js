/**
 * language enum
 * @enum {string}
 */
var $L = {

	"ADULT": "普通成人",
	"CHILD": "儿童",
	"STUDENT": "留学生",
	"PASS_USER": "常用乘机人",
	"CONTACT_USER": "常用联系人",
	"FOLD": "收起",
	"EXP": "展开",

	"SEL_CITY": "选择市",
	"SEL_DIS": "选择区/县",
	"NEW_ADDR": "新地址",
	"DEF_KDKEY": "全国",

	"DEF_COUNTRY": "中国",

	"MAX_SEAT": "<span class='highlight'>抱歉，当前价格剩余机票${max}张，请尽快预订，以免机票被售空。</span>",
	"QUERY_SEAT" : '正在为您实时查询剩余座位数量<img style="vertical-align:middle;margin-top:-3px;" src="http://source.qunar.com/site/images/loading.gif">',
	"QUERY_SEAT_END" :　'当前价格剩余票量<span id="js_seatNum" class="highlight">${max}</span>张，请尽快预订，以免机票被售空',
	"NINE_SEAT": "每个订单最多可添加9位乘机人。",
	"DELETE_SEAT": "<span class='highlight'>抱歉，当前价格剩余机票${max}张，请删减乘机人至${max}人</span>",

	"LEAST": "至少保留1位乘机人",
	"NAME_EMPTY": "不能为空，请输入英文姓名，姓和名之间用“/”隔开，如Zhang/Hongqi(张红旗)。",
	"FIRST_NAME_EMPTY": "不能为空，请输入英文first name或拼音名字",
	"TF_FIRST_NAME_SPACE": "请输入英文first name或拼音名字",
	"LAST_NAME_EMPTY": "不能为空，请输入英文last name或拼音姓氏",
	"LAST_NAME_SPACE": "姓不支持空格",
	"TF_LAST_NAME_SPACE": "请输入英文last name或拼音姓氏",
	"NAME_ERR": "请输入英文或拼音",
	"TF_CONTACT_NAME_ERR": "请输入英文姓名，姓和名之间用“/”隔开，如Zhang/Hongqi(张红旗)。",
	"MOBILE_EMPTY": "不能为空，请确保准确填写联系人手机号码，否则可能会影响订单查询及退改签服务。",
	"MOBILE_ERR": "请填写正确的联系人手机号码",
	"EMPTY_EMAIL": "我们会将您的订单信息发送到您的电子邮箱，为了维护您的权益，请正确填写邮件地址！",
	"EMAIL_ERR": "请填写正确的邮箱地址",
	"COUNTRY_ERR": "没有找到您输入的国家或地区，请重新输入",
	"GENDER_ERR": "请选择性别",
	"CARD_EMPTY": "不能为空，请准确填写所选证件号码，否则将导致无法登机",

	"ERR": "请正确填写订票信息",

	"SYSTEM_BUSY": "系统繁忙，请稍后重试",
	"TOO_MUCH": "你未支付的订单太多了，休息一下再下单吧，要续继下单请联系客服。",
	"NO_SEAT": "经过实时核查，您预订的航班价格已经售完，您可以点击<a href=\"${url}\">这里</a>重新进行预订。",

	"DEF_RANDC": "根据航空公司规定执行",

	"PASSENGER": "乘机人",
	"BTHD_ERR": "出生日期必须小于当前时间",
	"AGE_ERR": "请输入年龄为2-12周岁的出生日期",
	"EXPIRY_DATE_ERR": "您的行程时间超过了证件有效期，将会影响您正常登机，建议重新办理后再预订。",
	"CHD_BTHD": "请输入年龄为2-12周岁的出生日期",
	"NEED_ADULT": "每个儿童必须由至少一个成人陪同乘机",
	"FORCE_ADULT": "请输入年龄大于12周岁的出生日期。",
	"INVOICE_EMPTY": "不能为空，抬头应为个人姓名或公司抬头。",
	"ADDR_ERR": "请选择发票的快递/邮寄地址的省市区县	",
	"MSG_ERR": "请输入留言内容",
	"REMARK_ERR": "备注信息不能超过250个字",
	"AGREEMENT": "请确认已阅读并同意《网络电子客票协议》",
	"SUBMITING": "正在提交订单…",

	"LOAD_TAX": "查询税费中...",
	"CONTAINS_TAX": "(含税价)",
	"NO_TAX": "(未含税)",

	"RISE": "上升",
	"DOWN": "下降",

	"PRICE_UP": "系统实时查询发现，您预订的舱位价格刚售完，我们为您找到了当前可预订最低价，比原价升高了<b style=\"color:red\">${diff}</b>元，我们已经为您修改价格信息，您可以继续预订。",
	"PRICE_DOWN": "系统实时查询发现更低价格，比原价降低了<b style=\"color:green;\">${diff}</b>元，我们已经为您修改价格信息您可以继续预定。",
	"TAX_CHANGE": "系统实时查询到您预定的航班税费为${tax}元，${trend}了<b style=\"color:${color}\">${diff}</b>元，我们已经为您修改税费信息，您可以继续预订。",
	"TAX_ZERO": "系统实时查询到您预订的航班税费为<b style=\"color:red\">${tax}</b>元，已经为您更新订单信息，您可以继续预定。",
	

	//"PRICE_CHANGE": "系统实时查询发现，您预订的航班价格${pr_trend}了<b style=\"color:${pr_color}\">${pr_diff}</b>元，我们已经为您修改价格信息，你可以继续预订${click_here}。",
	//"TAX_CHANGE": "系统实时查询发现，您预订的航班参考税费${tax_trend}了<b style=\"color:${tax_color}\">${tax_diff}</b>元，我们已经为您修改税费信息，您可以继续预订${click_here}。",
	//"PRICE_TAX_CHANGE": "系统实时查询发现，您预订的航班价格${pr_trend}了<b style=\"color:${pr_color}\">${pr_diff}</b>元，税费${tax_trend}了<b style=\"color:${tax_color}\">${tax_diff}</b>元，我们已经为您修改价格及税费信息，您可以继续预订${click_here}。",
	//"CLICK_HERE": "，也可以点击<a target=\"_blank\" href=\"${url}\">这里</a>重新搜索预订",

	"NOT_WORK": "由于当前已不在代理商工作时间，无法及时处理您的订单，您可以点击<a href=\"${url}\">这里</a>重新选择在工作时间的代理商进行预订。",
	"FOUR_HOUR": "由于您预订的航班距起飞时间已不足4小时，您可以联系${vendor}确认座位是否可售，联系电话：${phone}，也可以点击<a href=\"${url}\">这里</a>重新进行搜索",
	"TRAIN": "请注意：您预订的行程为空铁联运产品，其中${city}为高铁出行，具体乘坐方式请咨询代理商。",
	"TAIWAN_TIPS" : "大陆居民赴台个人游，为不影响您的出行，请准确填写《大陆居民往来台湾通行证》号，出入境需携带《大陆居民往来台湾通行证》与《台湾地区入出境许可证》两证缺一不可。"
};

function $m(key, param) {
	var msg = $L[key];
	return param ? $replace(msg, param) : msg;
}
