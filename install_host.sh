#!/bin/bash
HostName=com.awlnx.video_connector
Platform=$(uname -s)
#NativeMessagingDirChrome
#NativeMessagingDirChromium
Ichrome=false
Ichromium=false
DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
if [ "$Platform" == "Darwin" ]; then
	if [ "$(whoami)" == "root" ]; then
		NativeMessagingDirChrome="/Library/Google/Chrome/NativeMessagingHosts"
		NativeMessagingDirChromium="/Library/Application Support/Chromium/NativeMessagingHosts/"
	else
		NativeMessagingDirChrome="$HOME/Library/Application Support/Google/Chrome/NativeMessagingHosts"
		NativeMessagingDirChromium="$HOME/Library/Application Support/Chromium/NativeMessagingHosts/"


	fi
elif [ "$Platform" == "Linux" ]; then
		if [ "$(whoami)" == "root" ]; then
			NativeMessagingDirChrome="/etc/opt/chrome/native-messaging-hosts"
			NativeMessagingDirChromium="/etc/chromium/native-messaging-hosts/"
		else
			NativeMessagingDirChrome="$HOME/.config/google-chrome/NativeMessagingHosts"
			NativeMessagingDirChromium="$HOME/.config/chromium/NativeMessagingHosts"
		fi

	  	  

	fi

if [ "$Platform" != "Darwin" ] &&  [ "$Platform" != "Linux" ] ; then
	echo "invaild platform"
	exit


fi


echo "Do you wish to install for chrome?"
select yn in "Yes" "No"; do
	    case $yn in
		            Yes ) Ichrome=true; break;;
			            No ) break;;
				        esac
				done
echo "Do you wish to install for chromium?"
select yn in "Yes" "No"; do
	    case $yn in
		            Yes ) Ichromium=true; break;;
			            No ) break;;
				        esac
				done



if [ "$Ichrome" ]; then
	mkdir -p "$NativeMessagingDirChrome"
	cp "$DIR/$HostName.json" "$NativeMessagingDirChrome/."
	sed -i "s:#\*#:$DIR/$HostName.json:" "$NativeMessagingDirChrome/$HostName.json"
	sed -i "s:\\\:\\\\\\\:g" "$NativeMessagingDirChrome/$HostName.json"
fi

if [ "$Ichromium" ]; then
	mkdir -p "$NativeMessagingDirChromium"
	echo "$DIR/$HostName.json"
	echo "$NativeMessagingDirChromium/$HostName.json"
	echo $(cp "$DIR/$HostName.json" "$NativeMessagingDirChromium/$HostName.json")
	sed -i "s:#\*#:$DIR/connector:" "$NativeMessagingDirChromium/$HostName.json"
	sed -i "s:\\\:\\\\\\\:g" "$NativeMessagingDirChromium/$HostName.json"
fi











