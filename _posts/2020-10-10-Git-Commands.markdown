---
layout: post
title:  Git Useful Commands
date:   2020-10-10 10:18
image:  oop.jpg
tags:   [Fundation, Git]
---

**Revert file**  
```
git checkout [filename]
```

<!-- Line breaks -->
<br />

**How to revert command git commit -m 'message'**  
```
git reset --hard [commit] (origin)
```

<!-- Line breaks -->
<br />

**How to revert git push**  
```
git reset --hard [commit]
git push -- force
```

<!-- Line breaks -->
<br />

**When you want to fix an emergency bug but you alredy have your local code updated**  
```
git stash
git pop
```

<!-- Line breaks -->
<br />

**Create and checkout to a new branch**  
```
git checkout -b <branch-name>
git push origin <branch-name>
```

<!-- Line breaks -->
<br />

**How to rename a branch name**  
```
git branch -m <new-branchname>
```

**Delete local branch**  
```
git branch -d <local-branchname>
git push origin --delete <local-branchname>
```

<!-- Line breaks -->
<br />

**Checkout**  
e.g. checkout tag v1.0 code.
```
git fetch --all
git tag
git checkout v1.0
```

**Push tag**  
e.g. push tag v1.1.0 with msg 
```
git tag -d v1.1.0
git tag -a v1.1.0 -m "my car and my ads"
git push origin :v1.1.0
git push origin v1.1.0
```

<!-- Line breaks -->
<br />

 Reference:

 https://www.jianshu.com/p/165d040b4a0d