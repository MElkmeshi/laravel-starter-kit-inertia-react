<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\MarkMessagesAsRead;
use App\Actions\SendMessage;
use App\Http\Requests\StoreMessageRequest;
use App\Models\Conversation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

final readonly class ConversationController
{
    public function index(Request $request): Response
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        $conversations = Conversation::query()
            ->where('guest_id', $user->id)
            ->orWhere('host_id', $user->id)
            ->with(['property', 'guest', 'host', 'latestMessage'])
            ->latest()
            ->paginate(20)
            ->through(fn (Conversation $c) => [
                ...$c->toArray(),
                'other_participant' => $c->guest_id === $user->id ? $c->host : $c->guest,
                'last_message' => $c->latestMessage,
                'unread_count' => $c->messages()
                    ->where('sender_id', '!=', $user->id)
                    ->whereNull('read_at')
                    ->count(),
            ]);

        return Inertia::render('messages/index', [
            'conversations' => $conversations,
        ]);
    }

    public function show(Request $request, Conversation $conversation, MarkMessagesAsRead $action): Response
    {
        Gate::authorize('view', $conversation);

        /** @var \App\Models\User $user */
        $user = $request->user();

        $action->handle($conversation, $user);

        $conversation->load(['property', 'guest', 'host', 'messages.sender']);

        $otherParticipant = $conversation->guest_id === $user->id
            ? $conversation->host
            : $conversation->guest;

        return Inertia::render('messages/show', [
            'conversation' => [
                ...$conversation->toArray(),
                'other_participant' => $otherParticipant,
            ],
            'messages' => $conversation->messages,
        ]);
    }

    public function store(StoreMessageRequest $request, Conversation $conversation, SendMessage $action): RedirectResponse
    {
        Gate::authorize('sendMessage', $conversation);

        /** @var array{body: string} $validated */
        $validated = $request->validated();

        /** @var \App\Models\User $sender */
        $sender = $request->user();

        $action->handle($conversation, $sender, $validated['body']);

        return redirect()->back();
    }
}
