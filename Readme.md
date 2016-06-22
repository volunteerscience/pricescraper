Reboot Server:

   sudo killall nodejs
   sudo nodejs server.js > ~/server_log 2>&1 &
   tail -f ~/server_log

   
TODO:
  Report Price: /reportPrice/
coming from: https://www.google.com/flights/#search;f=IAD,DCA,BWI;t=HOU,IAH;d=2016-07-08;r=2016-07-12;
scraping
Unhandled rejection Error: spawn ENOENT
    at errnoException (child_process.js:988:11)
    at Process.ChildProcess._handle.onexit (child_process.js:779:34)
  
Installation:
  PhantomJS:   https://gist.github.com/julionc/7476620
  
  export PHANTOM_JS="phantomjs-2.1.1-linux-x86_64"
  