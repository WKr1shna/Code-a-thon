import json
import os

transcript_path = "/Users/himangshuyadav/.gemini/antigravity-ide/brain/e23cf820-f722-478a-8b18-5c44f358df54/.system_generated/logs/transcript.jsonl"
base_dir = "/Users/himangshuyadav/Desktop/mirai/hackathon/Code-a-thon"

print(f"Reading transcript from: {transcript_path}")
if not os.path.exists(transcript_path):
    print("Transcript path does not exist!")
    exit(1)

written_files = {}

with open(transcript_path, "r", encoding="utf-8") as f:
    for line in f:
        try:
            step = json.loads(line)
            tool_calls = step.get("tool_calls", [])
            for call in tool_calls:
                name = call.get("name")
                args = call.get("args", {})
                if not args:
                    continue
                # The args can be a dict or a JSON string depending on serialization
                if isinstance(args, str):
                    try:
                        args = json.loads(args)
                    except Exception:
                        continue
                
                target_file = args.get("TargetFile")
                if target_file:
                    # Clean target file path
                    target_file = target_file.strip('"').strip("'")
                    if "disasterSOS/apps/SOS/" in target_file:
                        if name == "write_to_file":
                            content = args.get("CodeContent")
                            if content:
                                # Strip extra quotes and escape sequences if stored as serialized string
                                content = content.strip('"')
                                # Replace escaped newlines/tabs
                                content = content.encode('utf-8').decode('unicode_escape')
                                # Ensure it doesn't end up with surrounding quotes if unicode_escape keeps them
                                if content.startswith('"') and content.endswith('"'):
                                    content = content[1:-1]
                                written_files[target_file] = content
                                print(f"Found write_to_file for: {target_file}")
                        elif name == "replace_file_content":
                            # We might have replacements, but we will apply write_to_file content first,
                            # then if we need to apply replacements, we can do it, or we can just apply all write_to_file.
                            # Let's log it.
                            print(f"Found replace_file_content for: {target_file}")
        except Exception as e:
            # Skip invalid lines
            continue

print(f"\nWriting {len(written_files)} files back to disk...")
for path, content in written_files.items():
    # Make sure parent directory exists
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Restored: {path}")

print("Done restoring files!")
