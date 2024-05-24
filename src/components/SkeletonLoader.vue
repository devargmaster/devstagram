<template>
  <div class="skeleton-loader">
    <div class="skeleton-avatar"></div>
    <div class="skeleton-content">
      <div class="skeleton-title"></div>
      <div class="skeleton-text"></div>
      <div class="skeleton-text"></div>
    </div>
  </div>
</template>

<style scoped>
.skeleton-loader {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  padding: 1rem;
  background-color: #fff;
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.skeleton-avatar {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background-color: #e0e0e0;
  margin-right: 1rem;
}

.skeleton-content {
  flex: 1;
}

.skeleton-title {
  width: 50%;
  height: 1rem;
  background-color: #e0e0e0;
  margin-bottom: 0.5rem;
  border-radius: 0.25rem;
}

.skeleton-text {
  width: 80%;
  height: 0.75rem;
  background-color: #e0e0e0;
  margin-bottom: 0.5rem;
  border-radius: 0.25rem;
}
</style>
