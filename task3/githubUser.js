async function getGitHubUser(username) {
  try {
    const response = await fetch(`https://api.github.com/users/${username}`);

    if (!response.ok) {
      throw new Error(`User not found yet: ${username}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error.message);
    return null;
  }
}

getGitHubUser("octocat") 