class PostApp {
  constructor(apiUrl) {
    this.API_URL = apiUrl;
    this.post = null; // 投稿は1件のみ

    // DOM
    this.postList = document.getElementById("postList");
    this.titleInput = document.getElementById("titleInput");
    this.contentInput = document.getElementById("contentInput");
    this.submitBtn = document.getElementById("submitBtn");

    // 編集モーダル
    this.editModal = document.getElementById("editModal");
    this.editTitle = document.getElementById("editTitle");
    this.editContent = document.getElementById("editContent");
    this.updateBtn = document.getElementById("updateBtn");
    this.cancelEditBtn = document.getElementById("cancelEditBtn");

    // 削除モーダル
    this.deleteModal = document.getElementById("deleteModal");
    this.deleteInfo = document.getElementById("deleteInfo");
    this.confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
    this.cancelDeleteBtn = document.getElementById("cancelDeleteBtn");

    this.init();
  }

  init() {
    this.submitBtn.addEventListener("click", () => this.createPost());
    this.cancelEditBtn.addEventListener("click", () => this.editModal.style.display = "none");
    this.updateBtn.addEventListener("click", () => this.updatePost());
    this.cancelDeleteBtn.addEventListener("click", () => this.deleteModal.style.display = "none");
    this.confirmDeleteBtn.addEventListener("click", () => this.confirmDelete());
    this.updateButtonsState();
  }

  addPostToDOM(post) {
    this.postList.innerHTML = `
      <strong>タイトル</strong><br><span class="post-title">${post.title}</span><br>
      <strong>記事内容</strong><br><span class="post-body">${post.body}</span>
      <div class="buttons">
        <button id="editBtn">編集</button>
        <button id="deleteBtn">削除</button>
      </div>
    `;
    document.getElementById("editBtn").addEventListener("click", () => this.startEdit());
    document.getElementById("deleteBtn").addEventListener("click", () => this.startDelete());
    this.updateButtonsState();
  }

  updateButtonsState() {
    const hasPost = this.post !== null;
    this.submitBtn.disabled = hasPost;
    const editBtn = document.getElementById("editBtn");
    const deleteBtn = document.getElementById("deleteBtn");
    if (editBtn) editBtn.disabled = !hasPost;
    if (deleteBtn) deleteBtn.disabled = !hasPost;
  }

  // --- 投稿 ---
  async createPost() {
    const title = this.titleInput.value.trim();
    const body = this.contentInput.value.trim();
    if (!title || !body) { alert("タイトルと内容は必須です"); return; }

    try {
      const response = await fetch(this.API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formArticleTitle: title,
          formArticleContent: body
        })
      });

      if (response.status === 201 || response.status === 200) {
        const data = await response.json();
        this.post = {
          id: data.id,
          title: data.formArticleTitle,
          body: data.formArticleContent
        };
        this.addPostToDOM(this.post);
        this.updateButtonsState();
        this.titleInput.value = "";
        this.contentInput.value = "";
      } else {
        console.error("Error creating post:", response.status);
      }
    } catch (err) {
      console.error("Network error:", err);
    }
  }

  // --- 編集 ---
  startEdit() {
    if (!this.post) return;
    this.editTitle.value = this.post.title;
    this.editContent.value = this.post.body;
    this.editModal.style.display = "flex";
  }

  async updatePost() {
    if (!this.post) return;
    const title = this.editTitle.value.trim();
    const body = this.editContent.value.trim();
    if (!title || !body) { alert("タイトルと内容は必須です"); return; }

    try {
      const response = await fetch(`${this.API_URL}/${this.post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formArticleTitle: title,
          formArticleContent: body
        })
      });

      if (response.status === 200 || response.status === 204) {
        
        const data = await response.json().catch(() => ({}));
        this.post.title = data.formArticleTitle || title;
        this.post.body = data.formArticleContent || body;
        this.postList.querySelector(".post-title").textContent = this.post.title;
        this.postList.querySelector(".post-body").textContent = this.post.body;
        this.editModal.style.display = "none";
      } else {
        console.error("Error updating post:", response.status);
      }
    } catch (err) {
      console.error("Network error:", err);
    }
  }

  // --- 削除 ---
  startDelete() {
  if (!this.post) return;
  this.deleteInfo.innerHTML = `タイトル: ${this.post.title}<br>内容: ${this.post.body}`;
  this.deleteModal.style.display = "flex";
}


  async confirmDelete() {
    if (!this.post) return;

    try {
      const response = await fetch(`${this.API_URL}/${this.post.id}`, {
        method: "DELETE"
      });

      if (response.status === 200 || response.status === 204) {
        this.post = null;
        this.postList.innerHTML = "<h3>投稿済みの記事一覧</h3>";
        this.deleteModal.style.display = "none";
        this.updateButtonsState();
      } else {
        console.error("Error deleting post:", response.status);
      }
    } catch (err) {
      console.error("Network error:", err);
    }
  }
}

// 初期化
const app = new PostApp("https://jsonplaceholder.typicode.com/posts");
