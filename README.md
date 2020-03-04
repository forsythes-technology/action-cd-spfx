## Octopus Deploy

This action creates an Octopus Release given a solution.


# Usage
```
# build solution

- uses: forsythes-technology/action-octopus-deploy@master
      with: 
        OCTOPUS_URL: ${{secrets.OCTOPUS_URL}}
        OCTOPUS_APIKEY: ${{secrets.OCTOPUS_APIKEY}}
        SOLUTION_PATH: dist
		DEPLOY_TO: Staging # Optional, if included the release will be deployed to this environment automatically
        PROJECT: Example-Project # Optional, if omitted repo name is used instead
        MS_TEAMS_WEBHOOK: <webhook_url> # Optional
```