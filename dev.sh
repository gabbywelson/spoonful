#!/bin/bash

# Spoonful Development Environment
# Starts Convex, Web, and Mobile dev servers in a tmux session

SESSION="spoonful"

# Kill existing session if it exists
tmux kill-session -t $SESSION 2>/dev/null

# Start new session with Convex pane
tmux new-session -d -s $SESSION -n "dev" -x "$(tput cols)" -y "$(tput lines)"

# Configure tmux for this session
tmux set-option -t $SESSION mouse on
tmux set-option -t $SESSION status on
tmux set-option -t $SESSION status-position bottom
tmux set-option -t $SESSION status-style "bg=#a8c5a8,fg=#2d2d2d"
tmux set-option -t $SESSION status-left "#[bg=#c5b8d9,fg=#2d2d2d,bold] 🥄 SPOONFUL #[bg=#a8c5a8] "
tmux set-option -t $SESSION status-left-length 20
tmux set-option -t $SESSION status-right "#[fg=#2d2d2d] %H:%M "
tmux set-option -t $SESSION pane-active-border-style "fg=#a8c5a8"
tmux set-option -t $SESSION pane-border-style "fg=#c5b8d9"
tmux set-option -t $SESSION window-status-current-format "#[fg=#2d2d2d,bold] #W "

# Set pane border labels
tmux set-option -t $SESSION pane-border-format " #{pane_title} "
tmux set-option -t $SESSION pane-border-status top

# First pane: Convex
tmux select-pane -T "Convex"
tmux send-keys "pnpm run dev:convex" C-m

# Split horizontally for Web
tmux split-window -h -t $SESSION
tmux select-pane -T "Web"
tmux send-keys "pnpm run dev" C-m

# Split the right pane vertically for Mobile
tmux split-window -v -t $SESSION
tmux select-pane -T "Mobile"
tmux send-keys "pnpm run dev:mobile" C-m

# Balance panes and select the first one
tmux select-layout -t $SESSION main-vertical
tmux select-pane -t $SESSION:0.0

# Attach to session
tmux attach-session -t $SESSION
