Reboot Server:

   sudo killall nodejs
   sudo nodejs server.js > ~/server_log 2>&1 &
   tail -f ~/server_log

   
Installation:

  PhantomJS:   https://gist.github.com/julionc/7476620
  
  export PHANTOM_JS="phantomjs-2.1.1-linux-x86_64" 
  