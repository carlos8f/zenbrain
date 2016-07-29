var Entities = require('html-entities').AllHtmlEntities
var entities = new Entities()
var request = require('micro-request')
var resolveUrl = require('url').resolve
var version = require('../../package.json').version
var sig = require('sig')
var parseUrl = require('url').parse
var assert = require('assert')
var robotsParser = require('robots-parser')
var USER_AGENT = 'zenbrain/' + version
var bytes = require('bytes')
var minimatch = require('minimatch')

module.exports = function container (get, set, clear) {
  var map = get('map')
  var c = get('config')
  process.on('uncaughtException', function (err) {
    get('logger').error('uncaught', err, {feed: 'errors'})
  })
  return function mapper (cb) {
    var rs = get('run_state')
    if (!rs.queue || !rs.queue.length) {
      rs.queue = [c.crawler_start_url]
    }
    var num_active = 0
    for (var i = 0; i < require('os').cpus().length; i++) {
      num_active++
      getNext()
    }
    function getNext () {
      var current_url = rs.queue.shift()
      if (!current_url) {
        if (!--num_active) {
          get('logger').info('mapper', 'done mapping. closing!')
          get('app').close(function () {
            process.exit()
          })
        }
        return
      }
      var cache_key = sig(current_url)
      try {
        var parsedUrl = parseUrl(current_url)
        assert(parsedUrl.protocol.match(/^http/))
        c.crawler_blacklist.forEach(function (pat) {
          assert(!minimatch(parsedUrl.hostname, pat))
        })
      }
      catch (e) {
        return getNext()
      }
      var robots_txt_url = resolveUrl(parsedUrl.protocol + '//' + parsedUrl.host, '/robots.txt')
      var robots_txt_id = sig(robots_txt_url)
      get('thoughts').select({query: {app_name: get('app_name'), key: robots_txt_id}, limit: 1}, function (err, result) {
        if (err) throw err
        if (result.length) {
          get('logger').info('mapper', 'cached'.grey, robots_txt_url.grey)
          return withRobotsTxt(result[0].value.headers, result[0].value.body)
        }
        request(robots_txt_url, {headers: {'User-Agent': USER_AGENT}}, function (err, resp, body) {
          if (err) {
            get('logger').error('request err', robots_txt_url, err, {feed: 'errors'})
            return setImmediate(getNext)
          }
          get('logger').info('mapper', 'fetched', robots_txt_url, resp.statusCode)
          resp.headers.statusCode = resp.statusCode
          map(robots_txt_id, {url: robots_txt_url, headers: resp.headers, body: body, is_base64: false})
          var favicon_url = robots_txt_url.replace('robots.txt', 'favicon.ico')
          rs.queue.push(favicon_url)
          withRobotsTxt(resp.headers, body)
        })
      })
      function withRobotsTxt (headers, body) {
        if (headers.statusCode === 200 && typeof body === 'string') {
          return withRobots(robotsParser(robots_txt_url, body))
        }
        else if (headers.statusCode === 404) {
          // go for it anyway
          return withRobots(true)
        }
        else {
          return setImmediate(getNext)
        }
      }
      function withRobots (robots) {
        if (robots === true || (robots && robots.isDisallowed(current_url, USER_AGENT))) {
          get('logger').info('mapper', 'disallowed'.red, current_url.grey)
          return setImmediate(getNext)
        }
        get('thoughts').select({query: {app_name: get('app_name'), key: sig(current_url)}, limit: 1}, function (err, result) {
          if (err) throw err
          if (result.length) {
            get('logger').info('mapper', 'cached'.grey, current_url.grey, result[0].value.headers.statusCode.grey)
            return setImmediate(getNext)
          }
          request(current_url, {headers: {'User-Agent': USER_AGENT}}, function (err, resp, body) {
            if (err) {
              get('logger').error('request err', current_url, err, {feed: 'errors'})
              return setImmediate(getNext)
            }
            get('logger').info('mapper', 'crawled', current_url.white, resp.statusCode, bytes(Buffer(body).length), (resp.headers['content-type'] || '').grey, rs.queue.length, 'left')
            var linkCount = 0
            var is_base64 = false
            if (resp.statusCode === 200 && typeof body === 'string') {
              var links = body.match(/<a [^>]*href=('|")[^'"]+('|")[^>]*>/gi)
              var new_links = 0
              if (links) {
                links.forEach(function (link) {
                  if (!link) return
                  function getAttr (name) {
                    var matches = link.match(new RegExp('<a [^>]*' + name + '=(?:\'|")([^\'"]+)(?:\'|")[^>]*>', 'i'))
                    return matches && matches[1]
                  }
                  var rel = getAttr('rel')
                  if (rel && rel.match(/nofollow/)) return
                  var href = getAttr('href')
                  if (!href || href.match(/^#/)) return
                  href = resolveUrl(current_url, href).replace(/#.*/, '')
                  if (rs.queue.length < c.crawler_queue_limit && rs.queue.indexOf(href) === -1) {
                    rs.queue.push(href)
                    new_links++
                  }
                })
              }
              get('logger').info('mapper', 'found'.grey, new_links, 'new links.'.grey)
            }
            else {
              get('logger').info('mapper', 'result', resp.statusCode, typeof body, body && body.length)
              if (resp.headers['location']) {
                rs.queue.push(resolveUrl(current_url, resp.headers['location']))
              }
            }
            if (Buffer.isBuffer(body)) {
              is_base64 = true
              body = body.toString('base64')
            }
            resp.headers.statusCode = resp.statusCode
            map(sig(current_url), {url: current_url, headers: resp.headers, body: body, is_base64: is_base64})
            setImmediate(getNext)
          })
        })
      }
    }
  }
}
