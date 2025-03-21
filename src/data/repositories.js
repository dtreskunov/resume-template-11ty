import Fetch from '@11ty/eleventy-fetch'
import lodash from 'lodash'

// if you want to display your most starred github repositories,
// change this to your username. if not, set it to false.
const YOUR_GITHUB_USERNAME = 'maxboeck'

export default async function () {
    if (!YOUR_GITHUB_USERNAME) {
        return []
    }

    try {
        console.log('Fetching GitHub repos...')
        const repos = await Fetch(
            `https://api.github.com/users/${YOUR_GITHUB_USERNAME}/repos`,
            {
                duration: '1d',
                type: 'json'
            }
        )
        return lodash.orderBy(repos, 'stargazers_count', 'desc')
    } catch (e) {
        console.log('Failed fetching GitHub repos')
        return []
    }
}
