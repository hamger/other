var http = require('http')
var cheerio = require('cheerio')
var escaper = require("true-html-escape")
var url = 'http://www.imooc.com/learn/348'
var os = require("os");

// 过滤得到两者之间的字符串
function filterStr(str, start, end) {
    var str = str.toString().split(start)[1]       
    str = str.split(end)[0].trim()
    return escaper.unescape(str)
}

// 过滤目标文件并返回过滤结果
function filterChapters(html) {
    var $ = cheerio.load(html)
    var chapters = $('.chapter')
    var courseData = []

    chapters.each(function(item) {
        var chapter = $(this)
        // debugger;
        var chapterTitle = chapter.find('strong').html().toString().split('<div class="icon-info chapter-info">')[0]
        chapterTitle = chapterTitle.split('</i>')[1].trim()
        chapterTitle = escaper.unescape(chapterTitle)
        var vid = []
        var videos = chapter.find('.video').children('li')
        videos.each(function(item) {
            var id = $(this).attr("data-media-id")
            var videoTitle = $(this).find('.J-media-item').html()
            videoTitle = filterStr(videoTitle,'</i>','<button')
            vid.push({
                id: id,
                title: videoTitle
            })
		})

        var chapterData = {
            chapterTitle: chapterTitle,
            videos: vid
        }
        courseData.push(chapterData)
    })

    return courseData
}

// 打印课程信息
function printCourseInfo(courseData) {
	courseData.forEach(function (item) {
		var chapterTitle = item.chapterTitle
		console.log(chapterTitle + '\n')
		item.videos.forEach(function (video) {
			console.log('【' + video.id + '】'  + video.title +'\n')
		})
	})
}


http.get(url, function(res) {
    var html = ''

    // 每当接受到数据，将其叠放在变量中
    res.on('data', function(data) {
        html += data
    })

    res.on('end', function() {
    	var courseData = filterChapters(html) // 获取目标数据
        printCourseInfo(courseData) // 打印课程信息
    })
}).on('error', function() {
    console.log('获得课程数据失败！')
})