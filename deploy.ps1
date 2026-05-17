param(
    [Parameter(Mandatory=$true)]
    [string]$Version,
    [Parameter(Mandatory=$true)]
    [string]$Description
)

$ErrorActionPreference = "Stop"

# Vérifications préalables
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Error "Docker n'est pas installé ou n'est pas dans le PATH."
    exit 1
}
if (-not (kubectl version --client -o json 2>$null)) {
    Write-Error "kubectl n'est pas accessible."
    exit 1
}
if (-not (git status 2>$null)) {
    Write-Error "Ce répertoire n'est pas un dépôt Git."
    exit 1
}

# Étape 1 : Construire l'image Docker
Write-Host "Building Docker image ghcr.io/otomotho/sw-runes:$Version ..."
docker build -t "ghcr.io/otomotho/sw-runes:$Version" .
if ($LASTEXITCODE -ne 0) { throw "Docker build failed" }

# Étape 2 : Pousser l'image vers GHCR
Write-Host "Pushing image to GHCR..."
docker push "ghcr.io/otomotho/sw-runes:$Version"
if ($LASTEXITCODE -ne 0) { throw "Docker push failed" }

# Étape 3 : Mettre à jour le déploiement Kubernetes
Write-Host "Updating Kubernetes deployment..."
kubectl set image deployment/sw-runes app="ghcr.io/otomotho/sw-runes:$Version" -n sw-runes
if ($LASTEXITCODE -ne 0) { throw "kubectl set image failed" }
kubectl rollout status deployment/sw-runes -n sw-runes
if ($LASTEXITCODE -ne 0) { throw "Rollout failed" }

# Étape 4 : Annoter le déploiement
kubectl annotate deployment/sw-runes -n sw-runes "version=$Version" --overwrite
kubectl annotate deployment/sw-runes -n sw-runes "description=$Description" --overwrite
Write-Host "Deployment annotated with version $Version"

# Étape 5 : Mettre à jour CHANGELOG.md
$changelogPath = Join-Path $PSScriptRoot "CHANGELOG.md"
$date = Get-Date -Format "yyyy-MM-dd"
$newEntry = @"

## [$Version] - $date
### $Description
"@

if (Test-Path $changelogPath) {
    $content = Get-Content $changelogPath -Raw
    # Insère la nouvelle entrée après le titre principal s'il existe
    if ($content -match "# Changelog.*`n") {
        $newContent = $content -replace "(# Changelog.*`n)", "`$1$newEntry`n"
        Set-Content $changelogPath $newContent -NoNewline
    } else {
        Add-Content $changelogPath $newEntry
    }
} else {
    # Crée le fichier s'il n'existe pas
    @"
# Changelog

$newEntry
"@ | Out-File $changelogPath -Encoding utf8
}
Write-Host "CHANGELOG.md updated with entry for $Version"

# Étape 6 : Commit et tag Git
Write-Host "Committing and tagging Git..."
git add .
git commit -m "$Version : $Description"
git tag -a "$Version" -m "$Description"
git push origin main
git push origin "$Version"

Write-Host "Deployment completed successfully! Version $Version is live."
Write-Host "https://sw-runes.beerlover.live"