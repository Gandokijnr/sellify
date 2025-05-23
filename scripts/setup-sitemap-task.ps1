# PowerShell script to create a Windows Task Scheduler task for sitemap generation

# Define task parameters
$taskName = "Generate Sitemap"
$taskDescription = "Automatically generates sitemap.xml daily"
$scriptPath = "C:\Users\Gandoki\OneDrive\Desktop\selliffy\scripts\generate-sitemap.js"
$nodePath = "C:\Program Files\nodejs\node.exe"

# Create the task trigger (daily at 2 AM)
$trigger = New-ScheduledTaskTrigger -Daily -At 2:00AM

# Create the task action
$action = New-ScheduledTaskAction -Execute $nodePath -Argument "--experimental-specifier-resolution=node $scriptPath"

# Register the task
Register-ScheduledTask -TaskName $taskName -Trigger $trigger -Action $action -Description $taskDescription -RunLevel Highest

Write-Host "Task created successfully! The sitemap will now be generated daily at 2 AM."
Write-Host "You can manage this task in Windows Task Scheduler under Task Scheduler Library -> $taskName"
