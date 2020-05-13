<template>
  <div id="app">
    <header>
      <b-navbar type="dark" variant="dark">
        <b-navbar-brand :to="{ name: 'Home' }"
          >Google Classroom Tools</b-navbar-brand
        >
      </b-navbar>
    </header>
    <main class="container my-4 py-4 bg-white shadow-sm rounded">
      <router-view></router-view>
    </main>
  </div>
</template>
