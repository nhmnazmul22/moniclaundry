@echo off
setlocal

set DIR=%~dp0
set JAVA_EXE=java

if exist "%DIR%\gradle\wrapper\gradle-wrapper.jar" (
  "%JAVA_EXE%" -classpath "%DIR%\gradle\wrapper\gradle-wrapper.jar" org.gradle.wrapper.GradleWrapperMain %*
) else (
  echo Could not find gradle-wrapper.jar. Please sync project or generate wrapper.
  exit /b 1
)
