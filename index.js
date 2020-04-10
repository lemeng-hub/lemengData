const api = {
	test:function(){
		console.log("测试");
	},
	
	  // 分包函数
	  subPackage: function (e) {
	    console.log(e)
	    var rst = []
	    // 小程序不会对写入数据包大小做限制，但系统与蓝牙设备会限制蓝牙4.0单次传输的数据大小，超过最大字节数后会发生写入错误，建议每次写入不超过20字节
	    if (e.length <= 0) { // 错误
	      return false
	    } else if (e.length <= 36) { // 全包
	      rst[0] = {}
	      rst[0].cmd = ((e.length / 2 + 1).toString(16).length > 1 ? (e.length / 2 + 1).toString(16).toUpperCase() : '0' + (e.length / 2 + 1).toString(16)).toUpperCase() + '05' + e
	    } else { // 分包
	      var len = Math.ceil(e.length/36)
	      for (var i=0; i<len; i++) {
	        rst[i] = {}
	        if (i == 0) { // 开头
	          rst[i].cmd = '13' + '45' + e.slice(36 * i, 36 * (i + 1))
	        } else if (i == len-1) { // 结尾
	          var mids = e.slice(36 * i, 36 * (i + 1))
	          rst[i].cmd = ((mids.length / 2 + 1).toString(16).length > 1 ? (mids.length / 2 + 1).toString(16).toUpperCase() : '0' + (mids.length / 2 + 1).toString(16)).toUpperCase() + 'C5' + mids
	        } else { // 中间
	          rst[i].cmd = '13' + '85' + e.slice(36 * i, 36 * (i + 1))          
	        }
	      }
	    }
	    return rst
		// 0: {cmd: "1345BD0000000000000001240001B11581463897"}
		// 1: {cmd: "1385200158146389721336149805300133614980"},
		// 2: {cmd: "0EC553123456789001234567894516"}
		//将这三段字符串每个字符串的按顺序两个字符分为一组,将每组从16进制转换为10进制
	  },
	  
	  // 将str转化为数组
	  
	  
	  // 延时函数
	   sleep:function(n) {
			var start = new Date().getTime();
			//  console.log('休眠前：' + start);
			while (true) {
			  if (new Date().getTime() - start > n) {
				break;
			  }
			}
			// console.log('休眠后：' + new Date().getTime());
	  },
	
	  
// -------------------- -----------------分割线 ---------------------------------------------------
	//  分包 @param HEX
	packaging:function(Hexstr){
		var rst = [];
		// 18 字节作切割
		var len = Math.ceil(Hexstr.length/36);
		if(Hexstr.length >= 36){
			for(let i=0;i<len;i++){
				if(i < (len-1) ){
					rst[i] = Hexstr.slice(36*i,36*(i+1))
				}else{
					rst[i] = Hexstr.slice(36*i)
				}
				
			}
		}
		return rst
		
	},
	
	
	
		// 字符串转16进制数组
		strToHexArray:function(str){
			//因为协议文档中，一个字节两个字符的控制命令，codeLength为命令字节数
			//取一半数据的长度作为arraybuffer的长度
			var buffer = new ArrayBuffer(str.length >> 1);
			let dataView = new DataView(buffer);
			let ind = 0;
			for (var i = 0, len = str.length; i < len; i += 2) {
				let code = parseInt(str.substr(i, 2), 16)
				console.log("code:"+code)
				dataView.setUint8(ind, code)
				ind++
			}
			return buffer;
		},
	  
	  
		wirtebluetooth:function(writeStrCode,deviceId,serviceId,characteristicId){
			let that = this;
			//调用函数 str to bufferArray
			let buffer = this.strToHexArray(writeStrCode);
			console.log("写入数据中deviceId：" + deviceId);
			console.log("写入数据中serviceId:" + serviceId);
			console.log("写入数据中characteristicId:" + characteristicId);
			console.log("分割线************************************");
			uni.writeBLECharacteristicValue({
				deviceId,
				serviceId,
				characteristicId,
				value: buffer,
				success(res) {
					console.log('writeBLECharacteristicValue success', JSON.stringify(res))
				},
				fail(res) {
					console.log("写入数据失败", res)
				}
			});
			that.sleep(500);
		  
	  }
	
	
};
export default api;