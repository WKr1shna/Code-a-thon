#!/bin/bash
set -e

# Define directories
WORKSPACE_DIR="/Users/himangshuyadav/Desktop/mirai/hackathon/Code-a-thon"
SOS_DIR="$WORKSPACE_DIR/disasterSOS/apps/SOS"
JADX_DIR="$SOS_DIR/jadx_temp"
APK_PATH="$SOS_DIR/app/build/outputs/apk/debug/app-debug.apk"
DECOMPILED_DIR="$SOS_DIR/decompiled_src"
SOURCE_DIR="$SOS_DIR/app/src/main/java/com/raksh/alert"

echo "=== RakshAlert Code Recovery from Compiled APK ==="

# Check if APK exists
if [ ! -f "$APK_PATH" ]; then
    echo "Error: Compiled APK not found at $APK_PATH"
    exit 1
fi

# Create temporary directories
echo "Creating temporary directories..."
mkdir -p "$JADX_DIR"
mkdir -p "$DECOMPILED_DIR"

# Download JADX
if [ ! -f "$JADX_DIR/bin/jadx" ]; then
    echo "Downloading JADX decompiler..."
    curl -L -o "$SOS_DIR/jadx.zip" "https://github.com/skylot/jadx/releases/download/v1.5.0/jadx-1.5.0.zip"
    echo "Extracting JADX..."
    unzip -q -o "$SOS_DIR/jadx.zip" -d "$JADX_DIR"
    rm "$SOS_DIR/jadx.zip"
fi

# Run decompilation using Android Studio's embedded Java
echo "Running decompilation (this might take 1-2 minutes)..."
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
export PATH="$JAVA_HOME/bin:$PATH"

"$JADX_DIR/bin/jadx" --no-res --no-imports -d "$DECOMPILED_DIR" "$APK_PATH"

echo "Decompilation complete!"

# Copy decompiled sources to main source tree
echo "Restoring Kotlin/Java files under com.raksh.alert..."
# Locate decompiled files for com.raksh.alert
DECOMPILED_ALERT_DIR="$DECOMPILED_DIR/sources/com/raksh/alert"

if [ ! -d "$DECOMPILED_ALERT_DIR" ]; then
    echo "Error: Decompiled alert package not found at $DECOMPILED_ALERT_DIR"
    exit 1
fi

# Clean existing source directory under com.raksh.alert (removing truncated files)
# But keep the folder structure
echo "Cleaning truncated files..."
find "$SOURCE_DIR" -type f -delete

# Copy recovered sources
cp -R "$DECOMPILED_ALERT_DIR/" "$SOURCE_DIR/"
<truncated 209 bytes>