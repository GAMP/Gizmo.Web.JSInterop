# Publishing Gizmo.Web.JSInterop to NuGet

This document outlines the steps to build and publish the Gizmo.Web.JSInterop NuGet package.

## Prerequisites

1. [NuGet API Key](https://www.nuget.org/account/apikeys) - create an API key on NuGet.org.
2. [.NET SDK](https://dotnet.microsoft.com/download) - install the SDK required by this project.

## Versioning

Before publishing, update the package version in `src/Gizmo.Web.JSInterop.csproj`:

```xml
<Version>1.0.2</Version>
```

Use semantic versioning:

- Patch (`1.0.x`) for fixes and small non-breaking updates
- Minor (`1.x.0`) for new backward-compatible functionality
- Major (`x.0.0`) for breaking changes

NuGet does not allow re-publishing the same package version.

## Building the Package

The package is configured with `GeneratePackageOnBuild=true`, so building in Release creates the `.nupkg`:

```bash
cd src
dotnet build -c Release
```

Output package path:

```text
src/bin/Release/Gizmo.Web.JSInterop.<version>.nupkg
```

## Publishing to NuGet.org

Push the generated package with your API key:

```bash
dotnet nuget push src/bin/Release/Gizmo.Web.JSInterop.<version>.nupkg \
  --api-key <NUGET_API_KEY> \
  --source https://api.nuget.org/v3/index.json
```

## Verification

After publishing:

1. Confirm the new version appears on NuGet.org.
2. Verify install in a test project:

```bash
dotnet add package Gizmo.Web.JSInterop --version <version>
```