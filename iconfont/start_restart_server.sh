#/usr/bin/sh
pkill -9 node
export LOG=/home/hjsen/Qicon/iconfont/log
forever -l $LOG/access.log -e $LOG/error.log -o $LOG/out.log -a  start app.js