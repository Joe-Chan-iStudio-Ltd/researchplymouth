for file in *; do 
    echo mv "$file" "$(echo "$file" | tr -d '?\"'\\'"\"'')"
done
