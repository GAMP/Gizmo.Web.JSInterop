# Publishing Gizmo.Web.JSInterop to NuGet

This document outlines the steps to build and publish the Gizmo.Web.JSInterop NuGet package.

## Prerequisites

1. [NuGet API Key](https://www.nuget.org/account/apikeys) - You'll need to create an API key on the NuGet website
2. [.NET SDK](https://dotnet.microsoft.com/download) - Make sure you have the appropriate .NET SDK installed

## Building the Package

The package is configured to build automatically when the project is built thanks to the `GeneratePackageOnBuild` property. You can build it with:

```bash
cd Submodules/Gizmo.Web.JSInterop/src
dotnet build -c Release
