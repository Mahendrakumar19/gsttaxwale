
import re

def check_tags(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Remove comments
    content = re.sub(r'{\s*/\*.*?\*/\s*}', '', content, flags=re.DOTALL)
    content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)
    content = re.sub(r'//.*', '', content)
    
    # Find all JSX tags, including self-closing info
    # This regex matches <Tag or </Tag and checks if it ends with />
    matches = re.finditer(r'<(/?[a-zA-Z0-9.]+)([^>]*?)(/?)>', content)
    
    stack = []
    for match in matches:
        tag_name = match.group(1)
        attrs = match.group(2)
        is_self_closing = match.group(3) == '/'
        
        # Skip generic type parameters like <Customer[]> or <any[]>
        # Usually these are followed by [ or are inside types.
        # Simple heuristic: if it's uppercase and has [] or is followed by something non-JSX
        if tag_name[0].isupper() and (tag_name in ['Customer', 'DocumentUpload', 'HTMLInputElement', 'any', 'any[]']):
            continue

        if tag_name.startswith('/'):
            name = tag_name[1:]
            if not stack:
                print(f"Unexpected closing tag: <{tag_name}> at position {match.start()}")
                continue
            last_tag = stack.pop()
            if last_tag != name:
                print(f"Mismatched tags: <{last_tag}> and <{tag_name}> at position {match.start()}")
        elif is_self_closing:
            # print(f"Self-closing: <{tag_name}/>")
            continue
        else:
            # Some HTML tags are self-closing without /> in some parsers, 
            # but in JSX they MUST have /> or a closing tag.
            # However, React components are usually self-closing.
            stack.append(tag_name)
    
    if stack:
        print(f"Unclosed tags: {stack}")
    else:
        print("All tags balanced")

check_tags('d:/tax/frontend/src/components/admin/AdminDocumentUpload.tsx')
