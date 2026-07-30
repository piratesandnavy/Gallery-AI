FROM n8nio/n8n:2.32.6

USER root
ENV N8N_USER_FOLDER=/home/node/.n8n
COPY workflows /opt/gallery-ai/source-workflows
COPY cloud/n8n/start.sh /usr/local/bin/gallery-n8n-start
RUN mkdir -p /opt/gallery-ai/cloud-workflows \
    && cp /opt/gallery-ai/source-workflows/*.json /opt/gallery-ai/cloud-workflows/ \
    && sed -i 's#http://ollama:11434#http://gallery-ai-ollama.railway.internal:11434#g' /opt/gallery-ai/cloud-workflows/*.json \
    && sed -i 's#qwen3:4b#smollm2:135m#g' /opt/gallery-ai/cloud-workflows/*.json \
    && chmod +x /usr/local/bin/gallery-n8n-start \
    && chown -R node:node /opt/gallery-ai

# Railway volumes are initially owned by root. Keep the startup process as root so
# n8n can initialize and persist its SQLite database on /home/node/.n8n.
USER root
ENTRYPOINT ["tini", "--", "/usr/local/bin/gallery-n8n-start"]
