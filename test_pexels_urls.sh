#!/bin/bash

# Test all Pexels URLs from the application
urls=(
"https://images.pexels.com/photos/1396116/pexels-photo-1396116.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
"https://images.pexels.com/photos/1396117/pexels-photo-1396117.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
"https://images.pexels.com/photos/1396118/pexels-photo-1396118.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
"https://images.pexels.com/photos/1396119/pexels-photo-1396119.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
"https://images.pexels.com/photos/1396121/pexels-photo-1396121.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
"https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
"https://images.pexels.com/photos/1396132/pexels-photo-1396132.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
"https://images.pexels.com/photos/1428348/pexels-photo-1428348.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
"https://images.pexels.com/photos/1457841/pexels-photo-1457841.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
"https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
"https://images.pexels.com/photos/1457843/pexels-photo-1457843.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
"https://images.pexels.com/photos/1457844/pexels-photo-1457844.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
"https://images.pexels.com/photos/1571449/pexels-photo-1571449.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
"https://images.pexels.com/photos/1571453/pexels-photo-1571453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
"https://images.pexels.com/photos/1571458/pexels-photo-1571458.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
"https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
"https://images.pexels.com/photos/1571462/pexels-photo-1571462.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
"https://images.pexels.com/photos/1571464/pexels-photo-1571464.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
"https://images.pexels.com/photos/1571467/pexels-photo-1571467.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
"https://images.pexels.com/photos/1571468/pexels-photo-1571468.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
"https://images.pexels.com/photos/1571471/pexels-photo-1571471.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
"https://images.pexels.com/photos/1571472/pexels-photo-1571472.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
"https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
"https://images.pexels.com/photos/1918291/pexels-photo-1918291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
"https://images.pexels.com/photos/2029667/pexels-photo-2029667.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
"https://images.pexels.com/photos/2062426/pexels-photo-2062426.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
"https://images.pexels.com/photos/2467285/pexels-photo-2467285.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
"https://images.pexels.com/photos/271816/pexels-photo-271816.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
"https://images.pexels.com/photos/276625/pexels-photo-276625.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
"https://images.pexels.com/photos/276724/pexels-photo-276724.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
"https://images.pexels.com/photos/6782342/pexels-photo-6782342.jpeg?auto=compress&cs=tinysrgb&w=800"
"https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
)

working_urls=()
broken_urls=()

echo "Testing all Pexels URLs..."
echo "=========================="

for url in "${urls[@]}"; do
    photo_id=$(echo "$url" | grep -o 'photos/[0-9]\+' | cut -d'/' -f2)
    echo -n "Testing photo $photo_id: "
    
    response=$(curl -I "$url" -s | head -1)
    
    if [[ $response == *"200 OK"* ]]; then
        echo "✓ WORKING"
        working_urls+=("$url")
    elif [[ $response == *"404"* ]]; then
        echo "✗ BROKEN (404)"
        broken_urls+=("$url")
    else
        echo "? UNKNOWN ($response)"
        broken_urls+=("$url")
    fi
done

echo ""
echo "SUMMARY:"
echo "========"
echo "Working URLs: ${#working_urls[@]}"
echo "Broken URLs: ${#broken_urls[@]}"
echo ""

if [ ${#broken_urls[@]} -gt 0 ]; then
    echo "BROKEN URLs:"
    for url in "${broken_urls[@]}"; do
        echo "  $url"
    done
fi