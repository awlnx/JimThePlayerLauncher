:: taken from
:: https://chromium.googlesource.com/chromium/src/+/master/chrome/common/extensions/docs/examples/api/nativeMessaging/host/install_host.bat

:: Change HKCU to HKLM if you want to install globally.




REG ADD "HKCU\Software\Google\Chrome\NativeMessagingHosts\com.awlnx.video_connector.json" /ve /t REG_SZ /d "%~dp0com.awlnx.video_connector-win.json" /f

